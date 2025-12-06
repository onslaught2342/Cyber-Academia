/// <reference types="@cloudflare/workers-types" />
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { strToU8, strFromU8, compressSync, decompressSync } from 'fflate';

// ============ TYPES ============

export interface Env {
  ISSUER_SECRET: string;
  EMAIL_WORKER_URL: string;
  EMAIL_API_KEY: string;
  CYBER_ACADEMIA_USERS: KVNamespace;
  CYBER_ACADEMIA_DATA: KVNamespace;
  CYBER_ACADEMIA_SESSIONS: KVNamespace;
}

interface Subject {
  id: string;
  name: string;
  color: string;
  difficulty: number;
}

interface Task {
  id: string;
  subject: string;
  title: string;
  description: string;
  type: 'revision' | 'assignment' | 'exam' | 'practice';
  dueDate: string;
  duration: number;
  completed: boolean;
  priority: number;
}

interface ScheduleItem {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  completed: boolean;
}

interface UserStats {
  streak: number;
  totalStudyTime: number;
  tasksCompleted: number;
  lastStudyDate: string | null;
  subjectTime: Record<string, number>;
}

interface UserData {
  subjects: Subject[];
  tasks: Task[];
  schedule: ScheduleItem[];
  stats: UserStats;
}

interface UserRecord {
  email: string;
  passwordHash: string;
  firstName: string;
  verified: boolean;
  createdAt: number;
}

interface EmailPayload {
  email: string;
  firstName: string;
  subject: string;
  html?: string;
}

interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ============ CONSTANTS ============

const ALLOWED_ORIGINS = ['https://cyber-academia.onslaught2342.qzz.io'];

const TOKEN_EXPIRY = 60 * 60 * 24; // 24 hours
const TOKEN_REFRESH_THRESHOLD = 60 * 60; // 1 hour before expiry
const VERIFICATION_TTL = 60 * 15; // 15 minutes
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_BLOCK_TTL = 60 * 15; // 15 minutes
const JSON_BODY_LIMIT = 256 * 1024; // 256KB
const DATA_TTL = 60 * 60 * 24 * 365; // 1 year

// ============ UTILITIES ============

function corsHeaders(origin?: string): Record<string, string> {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  const origin = request?.headers.get('Origin') || '';
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function createToken(email: string, env: Env): string {
  return jwt.sign({ email }, env.ISSUER_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function verifyJWT(token: string, env: Env): Promise<string> {
  try {
    const decoded = jwt.verify(token, env.ISSUER_SECRET) as {
      email?: string;
      exp?: number;
    };
    if (!decoded || !decoded.email) throw new Error('Invalid token payload');
    return decoded.email;
  } catch {
    throw new Error('Unauthorized');
  }
}

async function parseJsonLimited(request: Request): Promise<any> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > JSON_BODY_LIMIT) {
    throw new Error('Payload too large');
  }
  const text = await request.text();
  if (text.length > JSON_BODY_LIMIT) throw new Error('Payload too large');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isValidEmail(e: unknown): e is string {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 255;
}

function isValidPassword(p: unknown): p is string {
  return typeof p === 'string' && p.length >= 8 && p.length <= 256;
}

function isValidName(n: unknown): n is string {
  return typeof n === 'string' && n.length >= 1 && n.length <= 100;
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============ COMPRESSION ============

function compressData(data: UserData): Uint8Array {
  const json = JSON.stringify(data);
  const uint8 = strToU8(json);
  return compressSync(uint8, { level: 9 });
}

function decompressData(compressed: ArrayBuffer): UserData {
  const uint8 = new Uint8Array(compressed);
  const decompressed = decompressSync(uint8);
  const json = strFromU8(decompressed);
  return JSON.parse(json);
}

function getDefaultUserData(): UserData {
  return {
    subjects: [],
    tasks: [],
    schedule: [],
    stats: {
      streak: 0,
      totalStudyTime: 0,
      tasksCompleted: 0,
      lastStudyDate: null,
      subjectTime: {},
    },
  };
}

// ============ EMAIL ============

async function sendEmail(
  env: Env,
  email: string,
  firstName: string,
  subject: string,
  html?: string
): Promise<boolean> {
  const payload: EmailPayload = { email, firstName, subject, html };

  try {
    const response = await fetch(env.EMAIL_WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    let data: EmailResponse;
    try {
      data = await response.json();
    } catch (err) {
      console.error('Response is not valid JSON:', await response.text());
      return false;
    }

    if (response.ok && data.success) {
      console.log('Email sent successfully!', data.data);
      return true;
    } else {
      console.error(`Failed to send email. Status code: ${response.status}`, data.error);
      return false;
    }
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

function getVerificationEmailHtml(firstName: string, code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:linear-gradient(135deg,#0f1419 0%,#1a1f2e 100%);border:1px solid #00d4ff33;border-radius:16px;padding:40px;text-align:center;">
      <h1 style="color:#00d4ff;font-size:28px;margin:0 0 8px;text-shadow:0 0 20px #00d4ff66;">
        ONSLAUGHT<span style="color:#a855f7;">2342</span>
      </h1>
      <p style="color:#888;font-size:14px;margin:0 0 30px;">Academic Command Center</p>
      
      <p style="color:#fff;font-size:18px;margin:0 0 10px;">Welcome, ${firstName}!</p>
      <p style="color:#aaa;font-size:14px;margin:0 0 30px;">Your verification code is:</p>
      
      <div style="background:#00d4ff15;border:2px solid #00d4ff;border-radius:12px;padding:20px;margin:0 0 30px;">
        <span style="color:#00d4ff;font-size:36px;font-weight:bold;letter-spacing:8px;font-family:monospace;">
          ${code}
        </span>
      </div>
      
      <p style="color:#888;font-size:12px;margin:0;">
        This code expires in 15 minutes.<br>
        If you didn't request this, ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ============ SCHEDULER LOGIC ============

function calculatePriority(task: Task, subjects: Subject[]): number {
  const subject = subjects.find((s) => s.id === task.subject);
  const difficulty = subject?.difficulty || 3;

  const now = new Date();
  const due = new Date(task.dueDate);
  const daysUntilDue = Math.max(0, (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Urgency: higher priority for closer deadlines
  const urgency = daysUntilDue === 0 ? 10 : Math.max(1, 10 - daysUntilDue);

  // Type weights
  const typeWeights: Record<string, number> = {
    exam: 1.5,
    assignment: 1.3,
    revision: 1.0,
    practice: 0.8,
  };
  const typeWeight = typeWeights[task.type] || 1.0;

  return (urgency * 0.5 + difficulty * 0.3 + (task.duration / 60) * 0.2) * typeWeight;
}

function generateSchedule(
  tasks: Task[],
  subjects: Subject[],
  availableMinutes: number = 240
): ScheduleItem[] {
  const incompleteTasks = tasks
    .filter((t) => !t.completed)
    .map((t) => ({ ...t, priority: calculatePriority(t, subjects) }))
    .sort((a, b) => b.priority - a.priority);

  const schedule: ScheduleItem[] = [];
  let usedMinutes = 0;
  const now = new Date();
  let currentTime = new Date(now);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

  for (const task of incompleteTasks) {
    if (usedMinutes + task.duration > availableMinutes) continue;

    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + task.duration * 60000);

    schedule.push({
      id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      taskId: task.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      completed: false,
    });

    currentTime = new Date(endTime.getTime() + 10 * 60000); // 10 min break
    usedMinutes += task.duration;
  }

  return schedule;
}

// ============ ROUTE HANDLERS ============

async function handleSignup(request: Request, env: Env): Promise<Response> {
  const body = await parseJsonLimited(request).catch(() => null);
  if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400, request);

  const { email, password, firstName } = body;

  if (!isValidEmail(email)) {
    return jsonResponse({ error: 'Invalid email format' }, 400, request);
  }
  if (!isValidPassword(password)) {
    return jsonResponse({ error: 'Password must be 8-256 characters' }, 400, request);
  }
  if (!isValidName(firstName)) {
    return jsonResponse({ error: 'First name is required (1-100 chars)' }, 400, request);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = await env.CYBER_ACADEMIA_USERS.get(normalizedEmail);
  if (exists) {
    return jsonResponse({ error: 'Email already registered' }, 409, request);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = generateVerificationCode();

  // Store pending user
  const pendingUser: UserRecord = {
    email: normalizedEmail,
    passwordHash,
    firstName: firstName.trim(),
    verified: false,
    createdAt: Date.now(),
  };

  await env.CYBER_ACADEMIA_USERS.put(`pending_${normalizedEmail}`, JSON.stringify(pendingUser), {
    expirationTtl: VERIFICATION_TTL,
  });

  await env.CYBER_ACADEMIA_SESSIONS.put(`verify_${normalizedEmail}`, verificationCode, {
    expirationTtl: VERIFICATION_TTL,
  });

  // Send verification email
  const emailHtml = getVerificationEmailHtml(firstName, verificationCode);
  const emailSent = await sendEmail(
    env,
    normalizedEmail,
    firstName,
    'Verify Your Onslaught2342 Account',
    emailHtml
  );

  if (!emailSent) {
    console.error('Failed to send verification email to:', normalizedEmail);
  }

  return jsonResponse(
    {
      success: true,
      message: 'Verification code sent to your email',
      emailSent,
    },
    200,
    request
  );
}

async function handleVerify(request: Request, env: Env): Promise<Response> {
  const body = await parseJsonLimited(request).catch(() => null);
  if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400, request);

  const { email, code } = body;
  if (!isValidEmail(email) || typeof code !== 'string') {
    return jsonResponse({ error: 'Invalid email or code' }, 400, request);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const storedCode = await env.CYBER_ACADEMIA_SESSIONS.get(`verify_${normalizedEmail}`);

  if (!storedCode || storedCode !== code.trim()) {
    return jsonResponse({ error: 'Invalid or expired verification code' }, 401, request);
  }

  const pendingUserRaw = await env.CYBER_ACADEMIA_USERS.get(`pending_${normalizedEmail}`);
  if (!pendingUserRaw) {
    return jsonResponse({ error: 'Registration expired. Please sign up again.' }, 410, request);
  }

  const pendingUser: UserRecord = JSON.parse(pendingUserRaw);
  pendingUser.verified = true;

  // Store verified user
  await env.CYBER_ACADEMIA_USERS.put(normalizedEmail, JSON.stringify(pendingUser));

  // Initialize user data
  const defaultData = getDefaultUserData();
  const compressed = compressData(defaultData);
  await env.CYBER_ACADEMIA_DATA.put(normalizedEmail, compressed, {
    expirationTtl: DATA_TTL,
  });

  // Clean up
  await env.CYBER_ACADEMIA_USERS.delete(`pending_${normalizedEmail}`);
  await env.CYBER_ACADEMIA_SESSIONS.delete(`verify_${normalizedEmail}`);

  // Issue token
  const token = createToken(normalizedEmail, env);

  return jsonResponse(
    {
      success: true,
      token,
      user: { email: normalizedEmail, firstName: pendingUser.firstName },
    },
    200,
    request
  );
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const body = await parseJsonLimited(request).catch(() => null);
  if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400, request);

  const { email, password } = body;
  if (!isValidEmail(email) || !isValidPassword(password)) {
    return jsonResponse({ error: 'Invalid email or password format' }, 400, request);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Rate limiting
  const blockKey = `block_${normalizedEmail}`;
  const attemptsKey = `attempts_${normalizedEmail}`;

  const blocked = await env.CYBER_ACADEMIA_SESSIONS.get(blockKey);
  if (blocked) {
    return jsonResponse({ error: 'Too many login attempts. Try again later.' }, 429, request);
  }

  const userRaw = await env.CYBER_ACADEMIA_USERS.get(normalizedEmail);
  if (!userRaw) {
    await incrementLoginAttempts(env, normalizedEmail, attemptsKey, blockKey);
    return jsonResponse({ error: 'Invalid credentials' }, 401, request);
  }

  const user: UserRecord = JSON.parse(userRaw);
  if (!user.verified) {
    return jsonResponse({ error: 'Please verify your email first' }, 403, request);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await incrementLoginAttempts(env, normalizedEmail, attemptsKey, blockKey);
    return jsonResponse({ error: 'Invalid credentials' }, 401, request);
  }

  // Clear login attempts on success
  await env.CYBER_ACADEMIA_SESSIONS.delete(attemptsKey);
  await env.CYBER_ACADEMIA_SESSIONS.delete(blockKey);

  const token = createToken(normalizedEmail, env);

  return jsonResponse(
    {
      success: true,
      token,
      user: { email: normalizedEmail, firstName: user.firstName },
    },
    200,
    request
  );
}

async function incrementLoginAttempts(
  env: Env,
  email: string,
  attemptsKey: string,
  blockKey: string
): Promise<void> {
  const currentAttempts = Number((await env.CYBER_ACADEMIA_SESSIONS.get(attemptsKey)) || 0) + 1;
  await env.CYBER_ACADEMIA_SESSIONS.put(attemptsKey, String(currentAttempts), {
    expirationTtl: LOGIN_BLOCK_TTL,
  });

  if (currentAttempts >= LOGIN_ATTEMPT_LIMIT) {
    await env.CYBER_ACADEMIA_SESSIONS.put(blockKey, '1', {
      expirationTtl: LOGIN_BLOCK_TTL,
    });
  }
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  // JWT is stateless, so logout is handled client-side by removing the token
  // Optionally, we could blacklist tokens here
  return jsonResponse({ success: true, message: 'Logged out' }, 200, request);
}

async function handleGetData(request: Request, env: Env, email: string): Promise<Response> {
  const compressed = await env.CYBER_ACADEMIA_DATA.get(email, {
    type: 'arrayBuffer',
  });

  if (!compressed) {
    // Initialize with default data
    const defaultData = getDefaultUserData();
    const newCompressed = compressData(defaultData);
    await env.CYBER_ACADEMIA_DATA.put(email, newCompressed, {
      expirationTtl: DATA_TTL,
    });
    return jsonResponse({ success: true, data: defaultData }, 200, request);
  }

  const data = decompressData(compressed);
  return jsonResponse({ success: true, data }, 200, request);
}

async function handleUpdateData(request: Request, env: Env, email: string): Promise<Response> {
  const body = await parseJsonLimited(request).catch(() => null);
  if (!body || !body.data) {
    return jsonResponse({ error: 'Invalid data payload' }, 400, request);
  }

  const data: UserData = body.data;

  // Basic validation
  if (
    !Array.isArray(data.subjects) ||
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.schedule)
  ) {
    return jsonResponse({ error: 'Invalid data structure' }, 400, request);
  }

  const compressed = compressData(data);
  await env.CYBER_ACADEMIA_DATA.put(email, compressed, {
    expirationTtl: DATA_TTL,
  });

  return jsonResponse({ success: true, message: 'Data saved' }, 200, request);
}

async function handleGenerateSchedule(
  request: Request,
  env: Env,
  email: string
): Promise<Response> {
  const body = await parseJsonLimited(request).catch(() => null);
  const availableMinutes = body?.availableMinutes || 240;

  const compressed = await env.CYBER_ACADEMIA_DATA.get(email, {
    type: 'arrayBuffer',
  });
  if (!compressed) {
    return jsonResponse({ error: 'No user data found' }, 404, request);
  }

  const data = decompressData(compressed);
  const newSchedule = generateSchedule(data.tasks, data.subjects, availableMinutes);

  data.schedule = newSchedule;

  const newCompressed = compressData(data);
  await env.CYBER_ACADEMIA_DATA.put(email, newCompressed, {
    expirationTtl: DATA_TTL,
  });

  return jsonResponse({ success: true, schedule: newSchedule }, 200, request);
}

async function handleVerifyToken(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return jsonResponse({ error: 'Missing token' }, 401, request);
  }

  try {
    const email = await verifyJWT(token, env);
    const userRaw = await env.CYBER_ACADEMIA_USERS.get(email);

    if (!userRaw) {
      return jsonResponse({ error: 'User not found' }, 404, request);
    }

    const user: UserRecord = JSON.parse(userRaw);

    // Check if token needs refresh
    let refreshToken: string | null = null;
    const decoded: any = jwt.decode(token);
    if (decoded?.exp && Date.now() / 1000 + TOKEN_REFRESH_THRESHOLD > decoded.exp) {
      refreshToken = createToken(email, env);
    }

    return jsonResponse(
      {
        success: true,
        user: { email, firstName: user.firstName },
        refreshToken,
      },
      200,
      request
    );
  } catch {
    return jsonResponse({ error: 'Invalid token' }, 401, request);
  }
}

// ============ MAIN HANDLER ============

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Public routes (no auth required)
      if (path === '/api/signup' && request.method === 'POST') {
        return await handleSignup(request, env);
      }

      if (path === '/api/verify' && request.method === 'POST') {
        return await handleVerify(request, env);
      }

      if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      }

      if (path === '/api/verify-token' && request.method === 'GET') {
        return await handleVerifyToken(request, env);
      }

      if (path === '/api/logout' && request.method === 'POST') {
        return await handleLogout(request, env);
      }

      // Protected routes (auth required)
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        return jsonResponse({ error: 'Unauthorized: missing token' }, 401, request);
      }

      let email: string;
      try {
        email = await verifyJWT(token, env);
      } catch {
        return jsonResponse({ error: 'Unauthorized: invalid token' }, 401, request);
      }

      // Data routes
      if (path === '/api/data' && request.method === 'GET') {
        return await handleGetData(request, env, email);
      }

      if (path === '/api/data' && request.method === 'PUT') {
        return await handleUpdateData(request, env, email);
      }

      if (path === '/api/schedule/generate' && request.method === 'POST') {
        return await handleGenerateSchedule(request, env, email);
      }

      // Health check
      if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: Date.now() }, 200, request);
      }

      return jsonResponse({ error: 'Not found' }, 404, request);
    } catch (err: any) {
      console.error('Worker error:', err);
      return jsonResponse({ error: err.message || 'Internal Server Error' }, 500, request);
    }
  },
};

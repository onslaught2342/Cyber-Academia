<div align="center" style="background: linear-gradient(to bottom, #000000, #333333); padding: 20px; border-radius: 12px;">
  <img src="public/logo.svg" alt="Cyber Academia Logo" width="120" />
</div>

  <h1 align="center">Cyber Academia</h1>
  <p align="center">
    Your academic command center. Manage subjects, tasks, and study schedules with ease.
  </p>
  <p align="center">
    <a href="#"><img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status"></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/React-18-blue.svg" alt="React"></a>
    <a href="#"><img src="https://img.shields.io/badge/Vite-5-yellow.svg" alt="Vite"></a>
    <a href="#"><img src="https://img.shields.io/badge/TypeScript-5-blue.svg" alt="TypeScript"></a>
    <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-3-cyan.svg" alt="Tailwind CSS"></a>
  </p>
</div>

---

## 🚀 Features

- **Dashboard**: A comprehensive overview of your academic progress, including stats, upcoming
  tasks, and subjects.
- **Task Management**: Create, edit, and track your tasks.
- **Subject Management**: Organize your subjects, set difficulty levels, and assign colors for
  better visualization.
- **Smart Scheduler**: Automatically generate a study plan for the day based on your tasks and their
  priorities.
- **Statistics**: Visualize your study habits with charts and stats.
- **Authentication**: Secure user authentication and protected routes.
- **Responsive Design**: A seamless experience across all devices.

## 🛠️ Technologies Used

- **Framework**: React (with TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: Zustand
- **Data Fetching**: Tanstack Query
- **UI Components**: Shadcn UI (a mix of custom components and Radix UI)
- **Linting**: ESLint
- **Formatting**: Prettier

## 📂 Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/         # Shadcn UI components
│   ├── hooks/
│   ├── lib/            # Utilities, API, etc.
│   ├── pages/          # Application pages
│   ├── stores/         # Zustand store
│   └── types/          # TypeScript types
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/)

### Installation & Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/cyber-academia.git
    cd cyber-academia
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Run the development server**:
    ```bash
    pnpm dev
    ```
    Your application should now be running on `http://localhost:5173`.

### Other Commands

- **Build for production**:

  ```bash
  pnpm build
  ```

- **Lint the code**:

  ```bash
  pnpm lint
  ```

- **Format the code**:
  ```bash
  pnpm format
  ```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and
create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by Onslaught2342.
</p>

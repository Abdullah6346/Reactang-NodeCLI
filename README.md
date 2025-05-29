# 🚀 React Tango Creator (`reactango`)

<div align="center">

![React Tango Creator Logo](https://img.shields.io/badge/⚡-React%20Tango%20Creator-blue?style=for-the-badge&logo=react)

[![npm version](https://img.shields.io/npm/v/reactango.svg?style=flat-square)](https://www.npmjs.com/package/reactango)
[![Node Version](https://img.shields.io/node/v/reactango.svg?style=flat-square)](https://www.npmjs.com/package/reactango)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/reactango?style=flat-square)](https://www.npmjs.com/package/reactango)

**The fastest way to bootstrap modern full-stack applications with React + Django**

[Quick Start](#-quick-start) • [Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## ✨ What is React Tango Creator?

`reactango` is a powerful command-line tool that instantly scaffolds production-ready full-stack applications using the **ReactTangoTemplate**. It combines the best of modern frontend and backend technologies:

Stop wasting time on boilerplate setup and start building features from day one!

## 🎯 Quick Start

Get your new project running in under 30 seconds:

```bash
# Install reactango globally
npm install -g reactango
# or with pnpm
pnpm add -g reactango
# or with yarn
yarn global add reactango

# Create your new project
reactango create my-awesome-project

# Navigate to your project
cd my-awesome-project
```

That's it! Your full-stack application is now ready!

## 🌟 Features

### 🏗️ **Instant Project Scaffolding**
- Creates a complete full-stack project structure in seconds
- No manual setup or configuration required
- Ready-to-use development environment

### 🔄 **Clean Git History**
- Automatically initializes a fresh Git repository
- Removes template history for a clean start
- Makes initial commit with all template files

### ⚙️ **Modern Tech Stack**
- **React 18** with hooks and modern patterns
- **TanStack Router** for type-safe routing
- **Vite** for lightning-fast development
- **Django** with REST Framework for robust APIs
- **TypeScript** for type safety across the stack

### 🐳 **Containerized Development**
- Docker Compose setup included
- Consistent development environment
- Easy deployment and scaling

### 🛠️ **Developer Experience**
- Hot reloading for both frontend and backend
- Pre-configured linting and formatting
- Organized project structure
- Comprehensive documentation

## 📦 Installation

### Install from npm (Recommended)

```bash
# Using npm
npm install -g reactango

# Using pnpm
pnpm add -g reactango

# Using yarn
yarn global add reactango
```

### Prerequisites

Before using `reactango`, ensure you have:

- **Node.js 18+** with npm/pnpm/yarn
- **Git** for version control
- **Python 3.7+** (for Django backend)

## 🚀 Usage

### Basic Usage

Create a new project with the default template:

```bash
reactango create my-project-name
```

### Advanced Options

```bash
# Create project with custom branch
reactango create my-project --branch develop

# Force initialize Git repository
reactango create my-project --init-git

# Skip Git initialization
reactango create my-project --no-init-git

# Install all dependencies automatically (backend & frontend)
reactango create my-project --install-all

# Skip all dependency installations and prompts
reactango create my-project --skip-all-install

# Don't use Python virtual environment for backend
reactango create my-project --no-venv

# Combine multiple options
reactango create my-project --branch develop --install-all --init-git

# Show help
reactango --help
```

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `project_name` | Name of your new project | Required |
| `--branch <branch>` | Specific branch of the template to clone | `main` |
| `--init-git` | Force initialization of a new git repository | Interactive prompt |
| `--no-init-git` | Force skipping git initialization | Interactive prompt |
| `--install-all` | Automatically install all dependencies (backend & frontend) | Interactive prompt |
| `--skip-all-install` | Skip all automatic dependency installations and prompts | Interactive prompt |
| `--no-venv` | Don't use a Python virtual environment for backend dependencies | Uses venv by default |
| `--help` | Show help message | - |

## 📚 What You Get

After running `reactango create`, your project will have:

```
/ (root)
├── api/                  # Django api
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   ├── welcome/
│   │   ├── __init__.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── __pycache__/
│   │   └── models/
│   │       ├── __init__.py
│   │       └── welcome.py
│   └── __pycache__/
├── app/                  # React app (TanStack Router)
│   ├── app.css
│   ├── root.tsx
│   ├── routes.ts
│   ├── routes/
│   │   └── home.tsx
│   └── welcome/
│       ├── logo-dark.svg
│       ├── logo-light.svg
│       └── welcome.tsx
├── config/               # Django config
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── __pycache__/
├── public/               # Static assets
│   └── favicon.ico
├── db.sqlite3
├── Dockerfile
├── install.js
├── manage.py
├── package.json
├── pnpm-lock.yaml
├── react-router.config.ts
├── requirements.txt
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Backend (Django)

1. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```

### Frontend (React + TanStack Router)

1. Install Node dependencies:
   ```sh
   pnpm install
   ```

### Install All (Backend + Frontend)

1. Run the installer script (with interactive options):
   ```sh
   node install.js
   ```
   - Use `--backend-only` to install only Django dependencies
   - Use `--frontend-only` to install only frontend dependencies
   - Use `--with-venv` to create and use a Python virtual environment

### Simple RUN

1. Run this:
   ```sh
   pnpm run dev
   ```

## 🔧 CLI Commands

The `reactango` CLI provides comprehensive options for creating and configuring your projects:

### Basic Command
```bash
# Create a new project with interactive prompts
reactango create <project-name>
```

### Full Command Reference
```bash
# Create with specific branch
reactango create my-app --branch develop

# Auto-install all dependencies without prompts
reactango create my-app --install-all

# Skip all installations for manual setup later
reactango create my-app --skip-all-install

# Control Git initialization
reactango create my-app --init-git        # Force Git init
reactango create my-app --no-init-git     # Skip Git init

# Python environment options
reactango create my-app --no-venv         # Skip virtual environment

# Combined options for automated setup
reactango create my-app --branch main --install-all --init-git
```

### Interactive vs Automated Modes

**Interactive Mode (Default):**
- Prompts you for Git initialization preference
- Asks about dependency installation options
- Guides you through Python virtual environment setup

**Automated Mode:**
- Use `--install-all` to skip prompts and install everything
- Use `--skip-all-install` to skip all installations
- Combine with other flags for fully automated project creation

### Other Commands
```bash
# Show version
reactango --version

# Show help
reactango --help
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/Abdullah6346/Reactang-NodeCLI/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Abdullah6346/Reactang-NodeCLI/discussions)
- **Documentation**: [Wiki](https://github.com/Abdullah6346/Reactang-NodeCLI/wiki)

## 🙏 Acknowledgments

- Built on top of the powerful [ReactTangoTemplate](https://github.com/Abdullah6346/ReactTangoTemplate)
- Inspired by tools like Create React App and Django startproject
- Thanks to all contributors and the open-source community

---

<div align="center">

**Made with ❤️ for the developer community**

[⭐ Star us on GitHub](https://github.com/Abdullah6346/Reactang-NodeCLI) if this project helped you!

</div>
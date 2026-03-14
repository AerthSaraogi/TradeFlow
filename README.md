# TradeFlow

A modern, full-stack workflow automation platform for trading, built with TypeScript, React, Express, and MongoDB.

## Features

- **Workflow Automation**: Build, visualize, and execute trading workflows with a drag-and-drop interface.
- **Modular Node System**: Easily add triggers (price, timer) and actions (exchange integrations) to your workflows.
- **User Authentication**: Secure signup/login with JWT-based authentication.
- **Exchange Integrations**: Connect to multiple exchanges (Hyperliquid, Backpack, Lighter) and manage API credentials.
- **Execution Engine**: Robust backend engine to process and execute workflows in real time.
- **Responsive UI**: Modern, mobile-friendly frontend built with React, Vite, Tailwind CSS, and shadcn/ui.
- **Type-Safe Shared Types**: Common types and interfaces shared between frontend and backend for reliability.

## Project Structure

```
TradeFlow/
├── backend/         # Express API, workflow engine, MongoDB models
│   └── src/
│       ├── db/models/      # Mongoose models (User, Workflow, etc.)
│       ├── executor/       # Workflow execution engine & services
│       ├── middleware/     # Auth middleware
│       ├── routes/         # Modular API routes (auth, user, workflow, executor)
│       └── index.ts        # App entry point
├── frontend/        # React app (Vite, TypeScript, Tailwind)
│   └── src/
│       ├── workflow/       # Workflow builder, nodes, sheets
│       ├── pages/          # App pages (Dashboard, Login, etc.)
│       ├── components/     # UI components (shadcn/ui)
│       └── lib/            # API utilities
├── common/          # Shared types/interfaces (TypeScript only)
│   └── src/index.ts
├── package.json     # Root scripts and dependencies
├── turbo.json       # Monorepo build config
└── ...
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (local or remote)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/AerthSaraogi/TradeFlow.git
   cd TradeFlow
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` (if present) and fill in required values (e.g., `MONGODB_URI`, `JWT_SECRET`).

### Running the App

#### Backend
```sh
cd backend
npm run dev
```
- Runs Express server on `http://localhost:3001` (default)

#### Frontend
```sh
cd frontend
npm run dev
```
- Runs React app on `http://localhost:5173` (default)

### Monorepo Scripts
- `npm run dev` (from root): Starts both frontend and backend in parallel (if configured)
- `npm run build` (from root): Builds all packages

## API Overview
- **Auth**: `/api/auth/signup`, `/api/auth/login`
- **User**: `/api/user/me`, `/api/user/credentials`
- **Workflow**: `/api/workflow/` (CRUD)
- **Executor**: `/api/executor/` (run workflows)

## Contributing
1. Fork the repo and create your branch from `main`.
2. Make your changes and add tests if applicable.
3. Run `npm run lint` and `npm test` to ensure code quality.
4. Submit a pull request.

## License
MIT

---

**TradeFlow** is an open-source project by [Aerth Saraogi](https://github.com/AerthSaraogi). Contributions and feedback are welcome!

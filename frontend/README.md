# Frontend

This directory contains the React/TypeScript frontend application for UniGuard Wallet.

## Structure

- `src/` - React application source code
  - `components/` - React components
  - `pages/` - Page components
  - `lib/` - Utility libraries and AI models
  - `hooks/` - React hooks
- `public/` - Static assets
- `index.html` - Application entry point

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server on port 8080.

## Build

```bash
npm run build
```

Builds the application for production to `dist/`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run notify:server` - Start notification server (backend)

## Configuration

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.js` - ESLint configuration

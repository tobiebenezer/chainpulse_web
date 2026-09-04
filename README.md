# ChainPulse Web

A real-time blockchain analytics and event monitoring web platform built with **Next.js App Router**, **React 19**, **TypeScript**, and **TanStack**.

---

## Overview

ChainPulse provides real-time visibility into blockchain transactions, contract events, and network metrics. The web frontend is engineered for low latency, smooth table virtualization, and responsive data streaming across active chains.

---

## Technical Highlights

- **Next.js App Router**: Route-group architecture separating core application views (`(app)`) from documentation (`(docs)`).
- **React 19 & React Compiler**: Optimized component rendering and memoization.
- **Server & Client State Management**: `@tanstack/react-query` for optimistic caching, background re-fetching, and query invalidation.
- **High-Performance Data Tables**: `@tanstack/react-table` handling complex sorting, filtering, and streaming transaction feeds.
- **Design System**: Tailwind CSS paired with Lucide React icons for a clean, responsive dark-mode interface.

---

## Project Structure

```
├── public/                 # Static assets and icons
├── src/
│   ├── app/
│   │   ├── (app)/          # Main dashboard views & streaming tables
│   │   ├── (docs)/         # API & integration documentation
│   │   ├── globals.css     # Design tokens and Tailwind utility layers
│   │   └── providers.tsx   # React Query and theme context providers
│   ├── components/
│   │   └── ui/             # Reusable design system primitives
│   └── lib/                # Utility helpers and API clients
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # Strict TypeScript configuration
└── package.json            # Project dependencies and scripts
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### 2. Installation
```bash
git clone https://github.com/tobiebenezer/chainpulse_web.git
cd chainpulse_web

pnpm install
# or: npm install
```

### 3. Development Server
Start the local Next.js development server:
```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
Create an optimized production build:
```bash
pnpm build
pnpm start
```

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19, Tailwind CSS, Lucide React |
| **Data Fetching** | TanStack React Query v5 |
| **Table & Virtualization** | TanStack React Table v8 |
| **Language** | TypeScript 5 (Strict Mode) |
| **Code Quality** | ESLint 9 |

---

## License

Built by [Tobi Ebenezer](https://github.com/tobiebenezer). MIT License.

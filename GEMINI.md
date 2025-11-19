# CareerFairy Monorepo Context

This document provides a comprehensive overview of the CareerFairy monorepo for AI agents. It outlines the architecture, development workflows, and key conventions.

## 1. Project Overview

**Type:** Monorepo (npm workspaces + Turborepo)
**Core Technologies:**

-  **Web:** Next.js (v13+), Material-UI, Redux, Reactfire
-  **Mobile:** React Native (Expo), Expo Router
-  **Backend:** Firebase (Auth, Firestore, Functions, Storage), BigQuery
-  **Language:** TypeScript (strict)

The platform facilitates career development and live events, featuring live streaming (Agora), groups, short-form video (Sparks), and job postings.

## 2. Build & Run Commands

**Important:** Always run `npm` commands from the **root** directory unless specified otherwise.

### Setup

-  `npm install`: Install dependencies for all workspaces.
-  `npm run prepare`: Setup Husky git hooks.

### Development

-  **Start All (Web + Emulators):** `npm run dev`
   -  Starts the Next.js web app.
   -  Starts Firebase Emulators (Auth, Firestore, Functions, Storage, UI).
   -  Requires ~10GB memory available.
-  **Start Mobile:** `npm run native` (or `cd apps/mobile && npm run start`)
-  **Fetch Dev Data:** `npm run start -w @careerfairy/fetch-firestore-data` (Downloads production backup to `emulatorData/fetched`).

### Building

-  **Build All:** `npm run build` (Uses Turbo to cache/parallelize).
-  **Build Web Only:** `npm run build:webapp`
-  **Build Functions:** `npm run build:functions`

### Testing

-  **Unit Tests (Jest):** `npm run test` (Runs tests across all packages).
-  **E2E Tests (Playwright):** `npm run test:e2e-webapp`
   -  Generates report in `apps/web/playwright-report`.
-  **Linting:** `npm run lint`

## 3. Architecture & Patterns

### Monorepo Structure

-  `apps/web`: Next.js frontend.
-  `apps/mobile`: Expo React Native app (often renders web views).
-  `packages/shared-lib`: **Core Business Logic**.
   -  **Pattern:** Repository (Firestore access) + Presenter (UI formatting).
   -  **Location:** `packages/shared-lib/src/{domain}/` (e.g., `livestreams`, `users`).
-  `packages/shared-ui`: Reusable React components.
-  `packages/functions`: Firebase Cloud Functions (Gen 2).
-  `packages/config-*`: Shared configurations (ESLint, TSConfig, MUI).

### Data Flow

1. **Reads:** Firestore -> Reactfire (hooks) -> React Components / Redux / Context.
2. **Writes:** UI -> Firestore Write -> Cloud Function Trigger -> Updates (BigQuery, Notifications, etc.).
3. **Search:** Algolia (synced via Cloud Functions).
4. **State Management:**
   -  **Global UI:** Redux.
   -  **Server Data:** Reactfire / SWR.
   -  **Feature Local:** React Context.

### Key Libraries

-  **Styling:** Material-UI (`@mui/material`) with a custom theme in `@careerfairy/config-mui`.
-  **Streaming:** Agora.
-  **Payments:** Stripe.
-  **Analytics:** Sentry, Customer.io, BigQuery.

## 4. Directory Map

```
/
├── apps/
│   ├── web/                # Next.js Application
│   │   ├── pages/          # Routes
│   │   ├── components/     # Web-specific components
│   │   └── data/           # Service integrations (Firebase, Algolia)
│   └── mobile/             # React Native Application
├── packages/
│   ├── shared-lib/         # Domain Logic (Entities, Repositories)
│   ├── shared-ui/          # Shared Components
│   ├── functions/          # Firebase Cloud Functions
│   ├── config-*/           # Shared Configs (MUI, Jest, TS)
│   ├── seed-data/          # Emulator data generators
│   └── fetch-firestore-data/ # Scripts to pull prod data
├── firebase.json           # Firebase config
├── firestore.rules         # Database security rules
└── turbo.json              # Build pipeline config
```

## 5. Development Conventions

-  **Formatting:** Prettier is enforced via pre-commit hook.
-  **Linting:** ESLint must pass before merging.
-  **Type Safety:** No `any`. Use shared types from `@careerfairy/shared-lib`.
-  **Component Location:**
   -  If generic: `packages/shared-ui`.
   -  If web-specific: `apps/web/components`.
-  **Adding Features:**
   1. Define Entity/Types in `shared-lib`.
   2. Create Repository/Presenter in `shared-lib`.
   3. Implement UI in `apps/web` or `apps/mobile`.
   4. Add Cloud Functions in `packages/functions` if needed.

## 6. Environment Variables

-  **Web:** `.env.local` (copy from `.env.local.example`).
-  **Functions:** `.env` (managed via `packages/functions/.env.local.example`).
-  **Mobile:** `.env` (managed via `apps/mobile/.env`).
-  **Secrets:** Never commit secrets. Use 1Password/Env files for local dev.

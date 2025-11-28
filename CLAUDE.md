# CareerFairy Monorepo Architecture

**Last Updated:** January 2025
**Monorepo Manager:** npm workspaces + Turborepo
**Node Version:** v22.x
**npm Version:** >=10.9.2

---

## Quick Links to Skills

For operational guidance, see these skills:

-  **Design System & UI Patterns**: Invoke the `design-system` skill
-  **Development Workflows**: Invoke the `dev-workflow` skill
-  **Troubleshooting**: Invoke the `troubleshooting` skill
-  **Deployment Operations**: Invoke the `deployment` skill

---

## High-Level Overview

CareerFairy is a full-stack platform for career development and live events:

-  **Web Application**: Next.js frontend with Material-UI
-  **Mobile Application**: React Native with Expo (iOS/Android)
-  **Backend**: Firebase (Auth, Firestore, Functions, Storage)
-  **Shared Libraries**: TypeScript packages for business logic and UI
-  **Tools & Scripts**: Data seeding, migrations, and automation

### Platform Capabilities

-  Live streamed events with Agora RTC
-  Groups and creator management
-  Short-form video (Sparks)
-  Custom job postings
-  Real-time notifications via Customer.io
-  Analytics via BigQuery

### Architecture Philosophy

-  **Code Sharing**: Monorepo enables maximum reuse between platforms
-  **Type Safety**: Full TypeScript across all packages
-  **Managed Build**: Turborepo handles incremental builds and caching
-  **Serverless**: Firebase Functions provide backend logic
-  **Real-time**: Firestore enables live data synchronization

---

## Monorepo Structure

```
careerfairy-monorepo/
├── apps/
│   ├── web/                    # Next.js web application
│   └── mobile/                 # React Native + Expo mobile app
├── packages/
│   ├── shared-lib/             # Core business logic (TypeScript)
│   ├── shared-ui/              # Reusable UI components
│   ├── config-mui/             # Material-UI theme configuration
│   ├── config-jest/            # Jest test environment
│   ├── config-tsconfig/        # TypeScript base configuration
│   ├── config-eslint/          # ESLint configuration
│   ├── functions/              # Firebase Cloud Functions
│   ├── seed-data/              # Development data generation
│   ├── fetch-firestore-data/   # Production data fetching
│   ├── firebase-scripts/       # Database migrations
│   ├── utils-test/             # Testing utilities
│   └── emulatorData/           # Local emulator snapshots
├── firebase.json
├── firestore.rules
├── storage.rules
├── turbo.json
└── package.json
```

**Workspace Organization**: npm workspaces defined in root `package.json` with `"workspaces": ["apps/*", "packages/*"]`

---

## Applications

### Web Application (`apps/web`)

**Tech Stack**: Next.js, Material-UI, Redux, Reactfire
**Key Features**: Authentication, Live streaming (Agora), Search (Algolia), Payments (Stripe), Maps (Mapbox), Analytics (Sentry, Customer.io)

**Directory Structure** (simplified):

```
apps/web/
├── pages/                  # Next.js pages and API routes
├── components/            # React components
│   ├── views/             # Page-specific
│   ├── page/              # Reusable sections
│   └── custom-hook/       # Custom hooks
├── context/               # React Context providers
├── store/                 # Redux (reducers, actions, slices)
├── data/                  # Service integrations (Firebase, Algolia, Stripe)
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

**State Management**: Hybrid approach with Reactfire (Firestore queries), Redux (global UI), Context (feature state), and SWR (function calls). See `design-system` skill for patterns.

**Testing**: Jest for unit tests, Playwright for E2E tests. See `dev-workflow` skill for commands.

### Mobile Application (`apps/mobile`)

**Tech Stack**: React Native + Expo, Expo Router
**Key Features**: Cross-platform iOS/Android, Deep linking (Branch), Push notifications, WebView wrapper for web content

**Architecture**: Mobile app primarily renders web app in WebView for code reuse, with native features (notifications, deep linking) via context bridges.

**Build Profiles**: preview, development, staging, production (see `eas.json`)

---

## Shared Packages

### 1. `@careerfairy/shared-lib`

**Purpose**: Core business logic, domain models, utilities shared across platforms
**Build**: TypeScript → CommonJS (dist/)

**Structure** (key domains):

```
packages/shared-lib/src/
├── livestreams/           # Livestream domain (Repository, Presenter, types)
├── groups/                # Group domain
├── sparks/                # Short video domain
├── users/                 # User domain
├── customJobs/            # Job postings
├── functions/             # Function definitions (FUNCTION_NAMES.ts)
├── notifications/         # Notification types
├── utils/                 # Shared utilities
└── BaseModel.ts           # Base for all domain entities
```

**Repository Pattern**: Each domain has:

-  **Repository**: Direct Firestore access (queries, writes)
-  **Presenter**: Transform data for UI
-  **Types**: TypeScript interfaces

Example: `LivestreamRepository` fetches data, `LivestreamPresenter` formats for display.

**Peer Dependencies**: firebase, axios, yup (prevents version conflicts between web v9 and mobile v10)

### 2. `@careerfairy/config-mui`

Material-UI theme, component overrides, global styles. Import via `import { brandedLightTheme } from "@careerfairy/config-mui"`

### 3. `@careerfairy/functions`

**Purpose**: Firebase Cloud Functions (Gen 2)
**Runtime**: Node 22, Region: europe-west1
**Build**: TypeScript with module aliasing

**Function Categories**:

-  **Auth**: createNewUserAccount, validateUserEmailWithPin_v2, deleteLoggedInUserAccount_v2
-  **Streaming**: fetchAgoraRtcToken_v2, notifyUsersWhenLivestreamStarts, startRecordingLivestream_eu, interactive features
-  **Groups**: createGroup, joinGroupDashboard_eu, changeRole_eu, analytics
-  **Sparks**: CRUD operations, getSparksFeed, trackSparkEvents_v6, analytics
-  **Integrations**: stripeWebHook, fetchATSJobs_eu, syncUserToCustomerIO, customerIOWebhook
-  **Bundles**: Event and analytics aggregation APIs

See `packages/functions/src/index.ts` for complete list.

### 4. Utility Packages

-  **seed-data**: Generates test data for emulators
-  **fetch-firestore-data**: Downloads production data for local dev
-  **firebase-scripts**: Database migrations and batch operations
-  **config-jest/tsconfig/eslint**: Shared configurations
-  **utils-test**: Testing utilities and mocks

---

## Key Technologies

**Frontend**: Next.js, React, Material-UI, Redux, Reactfire, SWR, Agora, Algolia, Stripe, Mapbox
**Mobile**: React Native, Expo, Expo Router, Branch
**Backend**: Firebase (Firestore, Auth, Functions, Storage), BigQuery, Customer.io, Mailgun/Postmark
**Dev Tools**: Turborepo, TypeScript, Jest, Playwright, ESLint, Prettier, Husky, Firebase Emulators

See `package.json` files for current versions.

---

## Data Flow Architecture

### Core Flows

**Authentication**:
Mobile/Web → Firebase Auth (Email + PIN) → CreateNewUserAccount Function → Initialize userData/userProfile → Sync Customer.io → Redux Store

**Live Streaming**:
Creator → createLivestream Function → Firestore → NotifyUsersWhenLivestreamStarts → Push/Email Notifications → Attendees → Agora RTC → BigQuery sync

**Real-time Sync**:
Firestore (source) → Reactfire subscription → React Components → Redux/Context → UI updates → User interaction → Firestore write → Triggers Functions → Stats/notifications/BigQuery

**Search**: User query → Algolia index → Ranked results (Background: Firestore → Functions → Algolia sync)

**Payments**: User → Stripe Checkout → stripeWebHook Function → Verify → Update userData → Firestore → App refresh

**Analytics**: User events → BigQuery → Functions aggregate → Cache in Firestore → Dashboard displays cached results

### Data Consistency

**Firestore Rules** (`firestore.rules`): 890 lines enforcing user data scoping, admin authorization, transaction-like counter increments, group-level permissions.

**Function Atomicity**: Multi-step operations use transactions with rollback on failure.

**Real-time**: Reactfire hooks auto-unsubscribe on unmount, preventing memory leaks.

---

## Build System

### Turborepo Pipeline

Configured in `turbo.json`:

-  `build` depends on `^build` (dependencies build first)
-  Caches `dist/**`, `.next/**`, `coverage/**`
-  `dev` never cached

**Dependency Graph**:

```
shared-lib (build first)
    ↓
functions, seed-data, firebase-scripts, shared-ui
    ↓
webapp, mobile (build last)
```

**Result**: 20-50% faster rebuilds via caching.

**Key Commands**: See `dev-workflow` skill for complete list.

---

## Firebase Integration

### Project Details

**Project ID**: careerfairy-e1fd9
**Region**: europe-west1 (GDPR)

### Firestore Collections (Summary)

-  **userData/{userEmail}**: Profile, settings, rewards, purchase history
-  **livestreams/{id}**: Event metadata, Agora channel, stats, recordings
-  **groups/{groupId}**: Creator profile, members/roles, billing, analytics
-  **sparks/{id}**: Video metadata, stats, group association
-  **customJobs/{id}**: Job postings, applications, expiration
-  **Reference data**: fieldsOfStudy, levelsOfStudy, interests, highlights
-  **System**: pushNotifications, cache/functions/analytics/{hash}

### Security

**Firestore Rules** (`firestore.rules`): Enforces user authentication, admin authorization, data validation, collection-level access control.

**Storage Rules** (`storage.rules`): Currently permissive (development mode).

See `deployment` skill for rules deployment procedures.

### Local Development

**Emulator Ports**: Auth (9099), Firestore (8080), Functions (5001), Storage (9199), UI (4000)

**Start**: `npm run dev` (auto-imports data from `emulatorData/`)

**Data Management**:

-  Fetch production: `npm run start -w @careerfairy/fetch-firestore-data`
-  Seed test data: `npm run build:seed-data`

See `dev-workflow` skill for complete emulator guide.

---

## Architectural Patterns

### Key Decisions

1. **Monorepo Over Multirepo**: Maximum code reuse, unified tooling, single pipeline, easier refactoring
2. **Firebase Backend**: Serverless, real-time sync, built-in auth, scalable
3. **TypeScript Everywhere**: Compile-time safety, excellent for monorepo-wide changes
4. **Hybrid State Management**: Redux (global), Context (features), SWR/Reactfire (server) - avoids over-engineering
5. **Repository + Presenter Pattern**: Isolates data access, transforms for UI, easy to test
6. **Turborepo**: Incremental builds, caching, scales with monorepo
7. **Emulator-first Development**: No production leaks, instant reset, offline capable

### Common Patterns

**Adding Domain Entity**:

1. Create folder in `packages/shared-lib/src/{entity}/`
2. Define types, Repository, Presenter
3. Export from index.ts
4. Use in apps

**Adding Cloud Function**:

1. Create in `packages/functions/src/{category}/`
2. Export from index.ts
3. Add to FUNCTION_NAMES in shared-lib
4. Test with emulator
5. Deploy

See `design-system` skill for UI/state management patterns.

---

## Integration Points

External services (summary):

| Service          | Purpose                        |
| ---------------- | ------------------------------ |
| Agora            | Live video streaming           |
| Algolia          | Search (livestreams, jobs)     |
| Stripe           | Payments                       |
| Customer.io      | Marketing automation, tracking |
| BigQuery         | Data warehouse, analytics      |
| Mailgun/Postmark | Transactional email            |
| Mapbox           | Location search                |
| Facebook/TikTok  | Event tracking                 |
| Sentry           | Error tracking                 |
| Merge API        | ATS integration                |
| ImageKit         | CDN media delivery             |

See `apps/web/data/` for client implementations.

---

## Getting Started

### For New Developers

1. **Setup**: Follow `dev-workflow` skill → Initial Setup
2. **Run locally**: `npm run dev` (starts web + emulators)
3. **Explore codebase**: Start with `packages/shared-lib/` for business logic
4. **Make changes**: See `dev-workflow` skill → Making Changes
5. **Need help**: See `troubleshooting` skill

### For Architects/Reviewers

-  This document covers: High-level architecture, package organization, data flow, key decisions
-  Operational details: See specialized skills (design-system, dev-workflow, troubleshooting, deployment)
-  Code references: Browse `packages/shared-lib/` for domain logic, `apps/web/` for UI patterns

---

## Document Metadata

**Last Updated**: January 2025
**Character Count**: ~7,800 (under 40k limit)
**Coverage**: Architecture overview, monorepo structure, key technologies, data flows, patterns
**Audience**: New developers, architects, contributors
**Next Review**: Quarterly or after major architectural changes

**Skills Available**:

-  `design-system` - UI patterns, state management, Material-UI, performance
-  `dev-workflow` - Setup, daily development, builds, testing, Git workflow
-  `troubleshooting` - Common issues and solutions
-  `deployment` - Vercel, Firebase, mobile deployment, CI/CD

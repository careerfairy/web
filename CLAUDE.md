# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CareerFairy is a monorepo containing web and mobile applications for career development and livestreaming events. The project uses pnpm workspaces with Turborepo for build orchestration, Next.js for the web frontend, React Native for mobile, and Firebase (Firestore, Functions, Auth, Storage) for backend services.

**Requirements:**

-  Node.js v22.10.0 (see `.nvmrc`)
-  pnpm >=10

## Common Development Commands

### Initial Setup

```bash
# Install all workspace dependencies
pnpm install

# Setup git hooks (run once after cloning)
pnpm run prepare

# Copy environment files
# apps/web/.env.local.example → apps/web/.env.local
# packages/functions/.env.local.example → packages/functions/.env.local
```

### Development Workflow (requires TWO terminals)

```bash
# Terminal 1: Start Firebase emulators (requires 10GB memory)
# Imports from emulatorData/fetched, exports on Ctrl+C
pnpm emulators

# Terminal 2: Start dev servers (webapp + TypeScript watchers)
pnpm dev

# Firebase Emulator UI: http://localhost:4000/
# Web app: http://localhost:3000/
```

### Building

```bash
# Build all workspaces
pnpm run build

# Build specific workspace
pnpm run build:webapp
pnpm run build:functions
pnpm run build:packages
```

### Testing

```bash
# Run all unit tests (Jest)
pnpm run test

# Run webapp E2E tests (Playwright)
pnpm run test:e2e-webapp

# View Playwright report after tests
pnpm run webapp:report
# Report location: apps/web/playwright-report/

# Debug E2E tests
pnpm run test:e2e-webapp-debug
```

### Running a Single Test File

```bash
# Jest (unit tests)
pnpm --filter @careerfairy/webapp test -- path/to/test.test.ts

# Playwright (E2E tests)
pnpm run test:e2e-webapp -- path/to/test.spec.ts

# Run specific test by name
pnpm run test:e2e-webapp -- -g "test name pattern"
```

### Linting and Formatting

```bash
# Lint all workspaces
pnpm run lint

# Format all files (Prettier)
pnpm run format
```

### Managing Dependencies

```bash
# Add dependency to specific workspace
pnpm add --filter @careerfairy/webapp <package-name>

# Remove dependency from workspace
pnpm remove --filter @careerfairy/webapp <package-name>
```

### Firebase Operations

```bash
# Deploy firestore rules
pnpm run deploy:rules

# Deploy a specific function (from packages/functions/)
cd packages/functions
pnpm exec firelink deploy --only functions:functionName

# Deploy a bundle
cd packages/functions
pnpm exec firelink deploy --only functions:bundle-bundleName

# Deploy hosting (for bundle mappings)
cd packages/functions
pnpm exec firebase deploy --only hosting

# Kill emulators if stuck
pnpm --filter @careerfairy/functions kill-emulators

# IMPORTANT: Stop emulators with Ctrl+C and wait for "Export complete"
```

### Firebase Scripts

```bash
# Run script on emulator
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=<path>

# Run script on production (use with caution)
pnpm run script --filter @careerfairy/firebase-scripts -- useProd=true scriptPath=<path>
```

### Fetching Production Data

```bash
# Fetch remote production backup to emulatorData/fetched
pnpm run start --filter @careerfairy/fetch-firestore-data
```

## High-Level Architecture

### Monorepo Structure

-  **apps/web**: Next.js 13 web application (main user-facing app)
-  **apps/mobile**: React Native mobile application
-  **packages/functions**: Firebase Cloud Functions (backend logic)
-  **packages/shared-lib**: Shared business logic, types, and Firebase repositories
-  **packages/shared-ui**: Shared React components
-  **packages/config-mui**: Material-UI theme configuration (palette, typography, components)
-  **packages/config-tsconfig**: Shared TypeScript configurations
-  **packages/firebase-scripts**: Admin scripts for Firestore operations
-  **packages/seed-data**: Test data for local development
-  **packages/fetch-firestore-data**: Tool to fetch production data snapshots

### Frontend Architecture (apps/web)

**Framework:** Next.js 13 with Pages Router (not App Router)

**Key Directories:**

-  `pages/`: Next.js pages and API routes
-  `components/views/`: UI components organized by page/feature
   -  `components/views/common/`: Shared components across pages
   -  `components/views/[page-name]/`: Page-specific components
-  `components/views/common/inputs/`: Branded input components (BrandedTextField, BrandedAutocomplete, etc.)
-  `context/`: React Context providers for global state
-  `hooks/`: Custom React hooks
-  `HOCs/`: Higher-order components
-  `layouts/`: Page layout components
-  `util/`: Utility functions and helpers
-  `store/`: Redux store (legacy, being migrated to Context)
-  `materialUI/`: Material-UI theme configuration (legacy, moved to packages/config-mui)

**State Management:**

-  Primary: React Context API
-  Legacy: Redux (still in use, being phased out)
-  Firebase: reactfire hooks for Firestore queries

**Styling:**

-  Material-UI v5 with Emotion (CSS-in-JS)
-  Theme system defined in `packages/config-mui/` (palette, typography, components, breakpoints)
-  Use `sx` prop for styling, centralized with `sxStyles` helper
-  **NEVER hardcode colors, use theme palette**
-  **NEVER hardcode typography styles, use Typography variants**

**Icons:** react-feather (preferred), fallback to @mui/icons-material

### Backend Architecture (packages/functions)

**Framework:** Firebase Cloud Functions v2 (Gen 2)

**Key Files:**

-  `index.ts`: Main function exports
-  `onWriteTriggers.ts`: Firestore document write triggers
-  `onCreateTriggers.ts`: Firestore document create triggers
-  `onDeleteTriggers.ts`: Firestore document delete triggers
-  `auth.ts`: Authentication-related functions
-  `livestreams.ts`: Livestream management
-  `stripe.ts`: Stripe payment webhook handling
-  `search.ts`: Algolia search indexing
-  `api/`: HTTP callable functions
-  `lib/`: Shared backend utilities

**Function Types:**

-  HTTP callable functions (REST API)
-  Firestore triggers (onCreate, onUpdate, onDelete)
-  Scheduled functions (cron jobs)
-  Auth triggers (onCreate, onDelete)

**External Services Integration:**

-  Algolia: Search indexing (livestreams, companies, users)
-  Stripe: Payment processing
-  Postmark/Mailgun: Email sending (sandbox in emulators)
-  Customer.io: Email marketing
-  Agora: Video/audio streaming
-  BigQuery: Analytics data export
-  Slack: Internal notifications

### Shared Library (packages/shared-lib)

**Purpose:** Share TypeScript types, business logic, and Firebase operations between frontend and backend

**Key Patterns:**

-  `BaseFirebaseRepository.ts`: Abstract class for Firestore CRUD operations
-  `BaseModel.ts`: Base class for data models
-  `BasePresenter.ts`: Base class for data presentation logic
-  Model-specific repositories (e.g., `livestreams/LivestreamRepository.ts`)
-  Shared types in `commonTypes.ts` and feature-specific type files

### Testing Strategy

**Unit Tests (Jest):**

-  Test utility functions, hooks, and business logic
-  Run pre-push via git hooks
-  Located alongside source files (e.g., `util.test.ts`)

**E2E Tests (Playwright):**

-  Test critical user flows with Firebase emulators
-  Located in `apps/web/tests/`
-  Runs against local emulator data
-  CI/CD uploads test reports as artifacts

**Testing in Docker (CI simulation):**

```bash
# Build test image (matches CI environment: Node 22, Playwright v1.49.0, ubuntu-22.04)
docker build -t careerfairy-tests -f apps/web/Dockerfile.test .

# Run all tests
docker run -p 9323:9323 -p 8080:8080 -p 5001:5001 -p 9099:9099 -p 9199:9199 \
  -e NEXT_PUBLIC_UNIQUE_WORKFLOW_ID="local-test" \
  careerfairy-tests

# Run specific shard (e.g., shard 3 of 5)
docker run -p 9323:9323 -p 8080:8080 -p 5001:5001 -p 9099:9099 -p 9199:9199 \
  -e NEXT_PUBLIC_UNIQUE_WORKFLOW_ID="local-test-shard-3" \
  careerfairy-tests -- --shard=3/5

# Port mappings:
# 9323 - Next.js dev server (webserver)
# 8080 - Firestore Emulator
# 5001 - Functions Emulator
# 9099 - Auth Emulator
# 9199 - Storage Emulator
```

## Design System Enforcement (CRITICAL)

**Design system files (packages/config-mui/):**

-  `palette.ts`: Complete color palette
-  `typography.ts`: Typography variants with responsive sizing
-  `components.ts`: Component styling (buttons, inputs, etc.)
-  `breakpoints.ts`: Custom responsive breakpoints

**Color Usage Rules:**

-  NEVER hardcode hex colors (#FFFFFF) or RGB/RGBA values
-  ALWAYS use theme palette via sx prop or component color props
-  Standard colors: Use string notation `"primary.main"`, `"neutral.700"`
-  Brand colors: MUST use theme function `theme => theme.brand.purple[300]`

**Typography Rules:**

-  NEVER hardcode fontSize, fontWeight, lineHeight
-  ALWAYS use Typography component with variant prop
-  Variants: `brandedH1`-`brandedH5`, `brandedBody`, `medium`, `small`, `xsmall`

**Component Reuse:**
Check for existing branded components before creating new ones:

-  Inputs: `BrandedTextField`, `BrandedAutocomplete`, `BrandedCheckbox`, `BrandedRadio`, `BrandedSwitch`
-  React Hook Form: `ControlledBrandedTextField`, `ControlledBrandedAutoComplete`
-  Menus: `BrandedMenu`, `BrandedResponsiveMenu`, `BrandedSwipeableDrawer`
-  Dialogs: `ConfirmationDialog`

**Spacing and Layout:**

-  Use theme spacing: `p: 2` (16px), `mt: 1` (8px), `gap: 2`
-  NEVER hardcode pixel values for margins/padding

**Responsive Design:**

-  Use custom breakpoints from `breakpoints.ts`
-  Breakpoints: `xs`, `sm`, `md`, `lg`, `xl`, `mobile`, `tablet`, `desktop`
-  Preferred: `sx={{ width: { xs: "100%", tablet: "50%" } }}`
-  NEVER hardcode media queries like `@media (max-width: 768px)`

**Styling Pattern:**

```tsx
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
  container: {
    color: "text.primary",
    backgroundColor: "primary.50",
    p: 2,
    borderRadius: 1,
    width: { xs: "100%", tablet: "50%" }
  },
  title: {
    color: theme => theme.brand.purple[300], // Brand colors need theme function
    mb: 2
  }
})

<Box sx={styles.container}>
  <Typography variant="brandedH3" sx={styles.title}>Title</Typography>
</Box>
```

## Code Style

**Formatting (enforced by Prettier):**

-  3 spaces for indentation
-  No semicolons
-  Configured in `.prettierrc.js`
-  Pre-commit hook auto-formats files

**Naming Conventions:**

-  camelCase: variables, functions
-  PascalCase: components, interfaces, types
-  Named exports for components

**TypeScript:**

-  Use TypeScript for all new code
-  Proper typing with interfaces/types
-  Avoid `any` type

## Git Workflow

**Branches:**

-  Main branch: `develop`
-  Feature branches: `feature/description` or `perf/description`

**Git Hooks (Husky):**

-  Pre-commit: Runs Prettier formatter and ESLint
-  Pre-push: Runs unit tests

**CI/CD:**

-  Runs on every push/PR
-  Executes E2E tests with Playwright
-  Uploads test reports as artifacts

## Firebase Emulator Ports

-  UI: http://localhost:4000/
-  Firestore: 8080
-  Functions: 5001
-  Auth: 9099
-  Storage: 9199
-  Hosting: 5000

## Important Notes

-  **Environment Variables:** Never commit `.env.local` files. Ask team for production values.
-  **Emulator Data:** Imported from `emulatorData/fetched/`, exported on Ctrl+C to same directory
-  **Memory:** Firebase emulators require ~10GB memory allocation
-  **File Structure:** Follow existing patterns in `components/views/` for new components
-  **Authentication:** All apps use Firebase Auth with custom claims for role-based access
-  **Data Fetching:** Use reactfire hooks (`useFirestoreDocData`, `useFirestoreCollectionData`) in webapp
-  **Error Handling:** Use try/catch for async operations, proper error boundaries for React components

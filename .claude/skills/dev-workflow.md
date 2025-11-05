# Development Workflow

This skill provides step-by-step guidance for daily development workflows in the CareerFairy monorepo.

## Initial Setup

### First Time Setup

```bash
# Clone and install
git clone <repo>
cd careerfairy-monorepo
npm install

# Setup environment variables
cp apps/web/.env.local.example apps/web/.env.local
cp packages/functions/.env.local.example packages/functions/.env.local
# Fill in values from team (check team docs or ask in Slack)

# Setup Git hooks (Husky)
npm run prepare
```

### Environment Variables

**Web App** (`.env.local`):

-  Firebase config (API keys, project ID)
-  Algolia keys
-  Stripe publishable key
-  Mapbox token
-  Other API keys

**Functions** (`.env.local`):

-  Firebase Admin SDK
-  Third-party API secrets
-  Service account keys

## Daily Development

### Option 1: Full Stack with Emulators (Recommended)

```bash
npm run dev
```

This starts:

-  Next.js web app on `http://localhost:3000`
-  Firebase emulators on `http://localhost:4000` (UI)
-  Hot reloading for code changes
-  Auto-import of emulator data

**Best for:** Full-stack feature development, testing functions locally

### Option 2: Web Only (Production Firebase)

```bash
npm run dev -w @careerfairy/webapp
```

Connects to production Firebase (requires production credentials in `.env.local`)

**Best for:** Frontend-only work, when emulators aren't needed

### Option 3: Functions Development

```bash
npm run dev -w @careerfairy/functions
```

Starts emulators and watches for function changes

**Best for:** Backend development, function testing

### Option 4: Mobile Development

```bash
npm run native
# Scan QR code with Expo Go app on your device
```

Starts Expo dev server with hot reloading

**Best for:** Mobile-specific features, testing native integrations

## Making Changes

### Web Feature Development

1. **Create feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Modify code** in `apps/web/`

   -  Components in `components/`
   -  Pages in `pages/`
   -  Hooks in `hooks/` or `components/custom-hook/`
   -  Styles in `materialUI/` or component-level

3. **Test locally**

   ```bash
   npm run dev
   # Visit http://localhost:3000 and test your feature
   ```

4. **Run tests**

   ```bash
   npm run test                  # Unit tests
   npm run test:e2e-webapp       # E2E tests (optional)
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your descriptive message"
   # Husky hooks will run linting and formatting
   ```

### Shared Logic Development

When adding/modifying shared business logic:

1. **Modify code** in `packages/shared-lib/src/`

   -  Domain logic in appropriate folder (e.g., `livestreams/`, `groups/`)
   -  Follow Repository + Presenter pattern
   -  Add TypeScript types

2. **Build shared-lib**

   ```bash
   npm run build:shared-lib
   ```

3. **Update consumers** (web/mobile/functions)

   -  Import and use new functionality
   -  Update types as needed

4. **Test integration**

   ```bash
   npm run dev
   # Test in web app

   npm run test -w @careerfairy/functions
   # Test in functions if applicable
   ```

### Firebase Function Development

1. **Create function file** in `packages/functions/src/`

   -  Choose appropriate directory (e.g., `api/`, `lib/streaming/`)
   -  Follow existing patterns for callable vs HTTP functions

2. **Export from index.ts**

   ```typescript
   // packages/functions/src/index.ts
   export { myNewFunction } from "./api/myNewFunction"
   ```

3. **Add to FUNCTION_NAMES** (optional, for type safety)

   ```typescript
   // packages/shared-lib/src/functions/FUNCTION_NAMES.ts
   export const FUNCTION_NAMES = {
      // ...existing
      myNewFunction: "myNewFunction",
   }
   ```

4. **Test with emulators**

   ```bash
   npm run dev -w @careerfairy/functions
   # Call function from web app or use Firebase Emulator UI
   ```

5. **Deploy** (after testing and review)
   ```bash
   npm run build:functions
   firebase deploy --only functions:myNewFunction
   ```

## Build Commands

### Building Packages

```bash
# Build everything (respecting dependencies)
npm run build

# Build specific packages
npm run build:packages      # All packages except apps
npm run build:functions     # Just Firebase Functions
npm run build:webapp        # Just Next.js app
npm run build:shared-lib    # Just shared-lib

# Native builds
npm run native-build:prod   # Production mobile build
```

### Turborepo Caching

Turborepo caches build outputs for faster rebuilds:

-  Caches `dist/**`, `.next/**`, `coverage/**`
-  Automatically invalidates when source changes
-  20-50% faster CI and local rebuilds

**Clear cache if needed:**

```bash
rm -rf node_modules/.cache/turbo
```

## Database Management

### Fetch Production Data for Local Development

```bash
npm run start -w @careerfairy/fetch-firestore-data
```

This:

1. Downloads latest production Firestore export
2. Stores in `emulatorData/fetched/`
3. Will be auto-imported next time emulators start

**Use case:** Test with production-like data locally

### Run Database Migrations

```bash
# Build scripts package
npm run build:scripts

# Run specific migration
npm run script -w @careerfairy/firebase-scripts -- migrations/backfill-fieldOfStudy.js
```

**Use case:** Backfill data, run batch operations

### Seed Development Data

If you don't have production data and need test data:

```bash
npm run build:seed-data
# Data will be generated when emulators start
```

## Git Workflow

### Branch Strategy

-  `main` - Stable production (rarely used)
-  `develop` - Main development branch (deploy to production)
-  `feature/*` - Feature branches (merge to develop via PR)
-  `hotfix/*` - Urgent fixes (merge to develop and main)

### Pre-commit Hooks

Husky automatically runs on `git commit`:

```bash
# Pre-commit
prettier --write                    # Format code
eslint --max-warnings=0             # Lint with 0 tolerance

# Pre-push
npm run test                        # Run unit tests
```

If hooks fail, fix issues before committing.

**Skip hooks only in emergencies:**

```bash
git commit --no-verify -m "emergency fix"
```

### Commit Message Convention

Follow conventional commits:

```bash
feat: add new livestream filter
fix: resolve timezone bug in calendar
docs: update API documentation
refactor: simplify user repository
test: add e2e tests for signup flow
chore: update dependencies
```

## Testing Workflow

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test.spec.ts

# Watch mode (auto-rerun on changes)
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

### E2E Tests

```bash
# Run all E2E tests (starts emulators automatically)
npm run test:e2e-webapp

# Debug mode (opens browser, pauses on failure)
npm run test:e2e-webapp-debug

# View test report
npm run webapp:report
```

**E2E tests require:**

-  Emulators running (auto-started by test script)
-  Test data seeded
-  Clean state between runs

### Function Tests

```bash
# Test functions package
npm run test -w @careerfairy/functions
```

**Note:** Function test coverage is limited; mostly test via E2E

## Working with Firebase Emulators

### Emulator Ports

-  Auth: `9099`
-  Firestore: `8080`
-  Functions: `5001`
-  Storage: `9199`
-  Hosting: `5000`
-  UI: `4000` (http://localhost:4000)

### Emulator UI Features

-  View Firestore data
-  Test functions manually
-  See auth users
-  Monitor function logs

### Data Persistence

Emulators auto-export data on shutdown to `emulatorData/` for next session.

**Manual export:**

```bash
firebase emulators:export ./emulatorData/manual-backup
```

**Import specific backup:**

```bash
firebase emulators:start --import=./emulatorData/manual-backup
```

## Monorepo Tips

### Installing Dependencies

```bash
# Install for root (affects all packages)
npm install <package>

# Install for specific workspace
npm install <package> -w @careerfairy/webapp
npm install <package> -w @careerfairy/functions
```

### Running Scripts in Workspaces

```bash
# Run script in specific workspace
npm run <script> -w @careerfairy/webapp
npm run <script> -w @careerfairy/functions

# Run script in all workspaces (if defined)
npm run <script> --workspaces
```

### Dependency Graph

Remember the build order:

```
shared-lib (build first)
    ↓
functions, seed-data, firebase-scripts, shared-ui
    ↓
webapp, mobile (build last)
```

When you change `shared-lib`, rebuild dependent packages.

## IDE Setup

### VS Code Extensions (Recommended)

-  ESLint
-  Prettier
-  Firebase
-  TypeScript and JavaScript Language Features
-  Jest Runner
-  Playwright Test for VS Code

### VS Code Settings

```json
{
   "editor.formatOnSave": true,
   "editor.defaultFormatter": "esbenp.prettier-vscode",
   "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
   }
}
```

## Quick Reference

### Most Common Commands

```bash
npm run dev                         # Start full dev environment
npm run test                        # Run unit tests
npm run build                       # Build all packages
npm run build:shared-lib            # Build shared library
npm run build:functions             # Build functions
firebase deploy --only functions    # Deploy functions
npm run native                      # Start mobile dev
```

### Useful Aliases (Add to your shell config)

```bash
alias cf-dev="npm run dev"
alias cf-test="npm run test"
alias cf-build="npm run build"
alias cf-mobile="npm run native"
```

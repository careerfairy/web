# CareerFairy Monorepo Architecture

**Last Updated:** October 28, 2025  
**Monorepo Manager:** npm workspaces + Turborepo  
**Node Version:** v22.x  
**npm Version:** >=10.9.2

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Applications](#applications)
4. [Shared Packages](#shared-packages)
5. [Key Technologies](#key-technologies)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Build System](#build-system)
8. [Testing Strategy](#testing-strategy)
9. [Firebase Integration](#firebase-integration)
10.   [Development Workflow](#development-workflow)
11.   [Deployment Architecture](#deployment-architecture)

---

## High-Level Overview

CareerFairy is a full-stack platform for career development and live events. The architecture consists of:

-  **Web Application**: Next.js frontend with Material-UI design system
-  **Mobile Application**: React Native with Expo (iOS/Android)
-  **Backend**: Firebase (Auth, Firestore, Functions, Storage)
-  **Shared Libraries**: TypeScript packages for business logic, UI components, and utilities
-  **Tools & Scripts**: Data seeding, Firebase migrations, and automation

The platform enables users to:

-  Attend live streamed events (with Agora RTC integration)
-  Interact with groups and creators
-  Track career-related data (sparks, custom jobs, interests)
-  Manage notifications and engagement through Customer.io
-  Access analytics and reports through BigQuery integration

### Architecture Philosophy

-  **Code Sharing**: Monorepo enables maximum code reuse between web and mobile
-  **Type Safety**: Full TypeScript across all packages
-  **Managed Build**: Turborepo handles incremental builds and caching
-  **Serverless**: Firebase Functions provide all backend logic
-  **Real-time**: Firestore enables real-time data synchronization

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
│   ├── config-mui/             # Material-UI theme and configuration
│   ├── config-jest/            # Jest test environment setup
│   ├── config-tsconfig/        # TypeScript base configuration
│   ├── config-eslint/          # ESLint configuration
│   ├── functions/              # Firebase Cloud Functions
│   ├── seed-data/              # Development data generation
│   ├── fetch-firestore-data/   # Production data fetching
│   ├── firebase-scripts/       # Database migrations and utilities
│   ├── bigquery-import/        # BigQuery integration
│   ├── utils-test/             # Testing utilities
│   └── emulatorData/           # Local emulator data snapshots
├── firebase.json               # Firebase configuration
├── firestore.rules             # Firestore security rules
├── storage.rules               # Cloud Storage rules
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Root workspace configuration
└── tsconfig.json               # Root TypeScript configuration
```

### Workspace Organization

The monorepo uses **npm workspaces** defined in root `package.json`:

```json
{
   "workspaces": ["apps/*", "packages/*"]
}
```

All dependencies are installed at the root, with shared modules linked internally using npm aliases.

---

## Applications

### 1. Web Application (`apps/web`)

**Framework:** Next.js 13.5.6  
**UI Library:** Material-UI v5.14  
**State Management:** Redux + Redux-Firestore  
**Real-time Updates:** Reactfire + react-redux-firebase

#### Key Features

-  **Authentication**: Firebase Auth with email/PIN verification
-  **Real-time Streaming**: Agora RTC integration for live events
-  **Search**: Algolia integration for livestream/job search
-  **Payments**: Stripe checkout integration
-  **Video Processing**: iCalendar event generation, video players
-  **Maps**: Mapbox integration for location-based features
-  **Analytics**: Sentry error tracking, Customer.io events, Analytics

#### Directory Structure

```
apps/web/
├── pages/                  # Next.js pages and API routes
│   ├── api/               # Next.js API endpoints
│   ├── [...path].tsx      # Catch-all routing
│   └── */                 # Feature pages (admin, group, streaming, etc.)
├── components/            # React components
│   ├── views/             # Page-specific components
│   ├── page/              # Reusable page sections
│   ├── helperFunctions/   # Pure utilities
│   ├── cms/               # CMS integration components
│   └── custom-hook/       # Custom React hooks
├── context/               # React Context providers
│   ├── firebase/          # Firebase service context
│   ├── agora/             # Streaming context
│   ├── notifications/     # Notification state
│   ├── spark/             # Spark feed tracking
│   └── */                 # Feature-specific contexts
├── store/                 # Redux store setup
│   ├── reducers/          # Redux reducers
│   ├── selectors/         # Redux selectors
│   ├── actions/           # Redux actions
│   └── slices/            # Redux Toolkit slices
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components (Admin, User, Streamer, etc.)
├── materialUI/            # MUI theme customization
├── data/                  # Data layer integration
│   ├── firebase/          # Firebase service initialization
│   ├── algolia/           # Algolia search client
│   ├── stripe/            # Stripe configuration
│   └── */                 # Other service clients
├── util/                  # Utility functions
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
├── HOCs/                  # Higher-order components
└── public/                # Static assets

```

#### State Management Pattern

**Redux + Reactfire Hybrid Approach:**

1. **Reactfire Hooks** for direct Firestore queries (real-time subscriptions)
2. **Redux Store** for global UI state and caching
3. **Context API** for feature-specific state (notifications, theme, streaming)
4. **SWR** for function calls and API data fetching

Example flow:

```typescript
// 1. Subscribe via Reactfire
const { data: user } = useUser(uid)

// 2. Store in Redux for UI state
dispatch(setCurrentUser(user))

// 3. Use Context for feature state
const { stream } = useContext(StreamContext)
```

#### Key Integration Points

-  **Firebase Instance** (`data/firebase/FirebaseInstance.ts`):

   -  Initializes Firebase app with emulator detection
   -  Sets up Firestore, Auth, Functions, and Storage clients
   -  Handles environment-based configuration

-  **Redux-Firestore Integration** (`pages/_app.tsx`):
   -  Configures react-redux-firebase with profile sync
   -  Attaches auth state change listeners
   -  Clears state on logout

#### Testing Setup

-  **Unit Tests**: Jest with jsdom environment
-  **E2E Tests**: Playwright for critical user flows
-  **Test Configuration** (`jest.config.ts`):
   -  Custom jsdom environment from `config-jest`
   -  Next.js babel preset for JSX transformation
   -  Ignores `.next`, node_modules, and landing pages

---

### 2. Mobile Application (`apps/mobile`)

**Framework:** React Native 0.74.5 + Expo  
**Navigation:** Expo Router  
**Deployment:** EAS (Expo Application Services)

#### Key Features

-  **Cross-platform**: iOS and Android from single codebase
-  **Deep Linking**: Branch integration for traffic attribution
-  **Push Notifications**: Expo Notifications + Customer.io
-  **In-app Tracking**: Facebook SDK, Customer.io, Sentry
-  **Secure Storage**: Expo SecureStore for auth tokens
-  **WebView Integration**: Displays web content within native app

#### Architecture

```
apps/mobile/
├── App.tsx                # Root component
├── index.ts               # Entry point
├── components/            # Native UI components
│   └── WebView.tsx        # Bridges web and mobile
├── utils/                 # Platform utilities
│   ├── firebase.ts        # Firebase initialization
│   ├── sentry.ts          # Error tracking
│   ├── customerio-tracking.ts
│   ├── facebook-tracking.ts
│   └── webview.utils.ts   # WebView communication
├── assets/                # Images and media
├── ios/                   # iOS native code
└── android/               # Android native code

```

#### Firebase Integration

Mobile uses Firebase v10.14.1 (newer than web's v9.23.0) for:

-  Auth (phone/email)
-  Real-time data
-  Cloud Functions

#### Key Architectural Decision

**WebView Wrapper Pattern**: Mobile app primarily renders the web app in a WebView, enabling:

-  Single codebase maintenance
-  Consistent UX between platforms
-  Rapid feature deployment
-  Native features via context bridges (notifications, deep linking)

The `WebView.tsx` component handles:

-  Navigation state sync
-  Message passing between native and web
-  URL scheme handling
-  Push notification integration

#### Build Configuration

**EAS Build Profiles** (`eas.json`):

-  **preview**: Development builds with expo-dev-client
-  **development**: Development builds for testing
-  **staging**: Pre-production builds
-  **production**: Production release builds

---

## Shared Packages

### 1. `@careerfairy/shared-lib`

**Purpose**: Core business logic, domain models, and utilities shared across all platforms  
**Build Tool**: tsc (TypeScript compiler)  
**Output**: CommonJS (dist/index.js)

#### Structure

```
packages/shared-lib/src/
├── livestreams/           # Livestream domain
│   ├── LivestreamRepository.ts    # Data access layer
│   ├── LivestreamPresenter.ts     # Data transformation
│   ├── livestreams.ts             # Domain logic and types
│   ├── stats.ts                   # Analytics models
│   ├── ratings.ts                 # Rating system
│   ├── recordings.ts              # Recording metadata
│   └── search.ts                  # Search integration
├── groups/                # Group domain
│   ├── GroupRepository.ts         # Data access
│   ├── GroupPresenter.ts          # Presentation logic
│   ├── groups.ts                  # Types and logic
│   ├── creators.ts                # Creator management
│   ├── planConstants.ts           # Subscription plans
│   └── telemetry.ts               # Group events
├── sparks/                # Spark (short video) domain
│   ├── sparks.ts                  # Domain logic
│   ├── SparkPresenter.ts          # Presentation
│   ├── sparksRepository.ts        # Data access
│   ├── analytics.ts               # Analytics models
│   └── public-notifications/      # Notification logic
├── users/                 # User domain
├── customJobs/            # Custom job postings
├── stripe/                # Payment integration
├── ats/                   # Applicant Tracking System
├── constants/             # Shared constants and enums
├── functions/             # Function definitions and types
│   └── FUNCTION_NAMES.ts  # Exported function names registry
├── notifications/         # Notification types
├── messaging/             # Messaging types
├── email/                 # Email templates and types
├── customerio/            # Customer.io integration
├── utils/                 # Utility functions
└── BaseModel.ts           # Base model for all domain entities

```

#### Key Concepts

**Repository Pattern**: Each domain entity (Livestream, Group, User, etc.) has:

-  **Repository**: Direct Firestore access (queries, writes)
-  **Presenter**: Transform repository data for UI
-  **Types**: Comprehensive TypeScript interfaces

**Example - Livestream Domain**:

```typescript
// Repository: Direct data access
class LivestreamRepository {
   getLivestream(id: string): Promise<Livestream>
   createLivestream(data): Promise<string>
   updateLivestream(id, data): Promise<void>
}

// Presenter: Data transformation
class LivestreamPresenter {
   formatLivestream(raw): FormattedLivestream
   formatStats(raw): StatsDisplay
}

// Types: Domain models
interface Livestream {
   id: string
   title: string
   groupIds: string[]
   status: "draft" | "scheduled" | "live" | "ended"
   startTime: Timestamp
   recordingId?: string
}
```

#### Peer Dependencies

The package is lightweight with peer dependencies:

-  `firebase` (apps must provide specific version)
-  `axios` (for HTTP calls)
-  `yup` (for validation)

This prevents version conflicts between web (v9) and mobile (v10) Firebase versions.

---

### 2. `@careerfairy/shared-ui`

**Purpose**: Reusable React components for web and mobile  
**Build Tool**: tsup (faster TypeScript bundling)  
**Output**: ESM and CommonJS

#### Structure

```
packages/shared-ui/src/
└── utils/                # Component utilities (may contain base components)
```

#### Current Status

Minimal components (mostly in `utils/`). Most UI is in:

-  Web: `apps/web/components/`
-  Mobile: `apps/mobile/components/`

This suggests shared-ui is being built incrementally.

---

### 3. `@careerfairy/config-mui`

**Purpose**: Material-UI theme, overrides, and global styles

#### Contains

-  MUI theme configuration
-  Global style definitions
-  Component overrides
-  Color schemes
-  Typography settings

Used by web app for consistent styling. Can be imported directly:

```typescript
import { brandedLightTheme } from "@careerfairy/config-mui"
```

---

### 4. `@careerfairy/functions`

**Purpose**: Firebase Cloud Functions source code  
**Framework**: Firebase Functions SDK v6.3.2 (Gen 2)  
**Build Tool**: tsc with module aliasing
**Language**: TypeScript (compiled to Node 22-compatible JS)

#### Structure

```
packages/functions/src/
├── api/                   # API endpoints (callable & HTTP functions)
├── lib/                   # Reusable function libraries
│   ├── streaming/         # Live event logic
│   ├── notifications/     # Push and email notifications
│   ├── customerio/        # Customer.io sync
│   ├── stripe/            # Payment processing
│   ├── search/            # Algolia indexing
│   ├── sparks/            # Short video logic
│   ├── recommendations/   # ML-based recommendations
│   ├── bigQuery/          # Data warehouse
│   ├── offline-events/    # In-person event handling
│   └── */                 # Other services
├── middlewares/           # Auth and validation middleware
├── html_emails/           # Email template HTML
├── index.ts               # Function exports
└── config.ts              # Environment configuration

```

#### Function Categories

**Authentication Functions**:

-  `createNewUserAccount` - New user signup
-  `validateUserEmailWithPin_v2` - Email verification
-  `deleteLoggedInUserAccount_v2` - User deletion
-  `backfillUserData` - Data initialization

**Real-time Streaming Functions**:

-  `fetchAgoraRtcToken_v2` - Agora tokens
-  `fetchAgoraRtmToken_v2` - Messaging tokens
-  `notifyUsersWhenLivestreamStarts` - Event notifications
-  `startRecordingLivestream_eu` - Recording management
-  `createPoll`, `createQuestion`, `toggleHandRaise` - Interactive features

**Group Management Functions**:

-  `createGroup_eu` - Group creation
-  `joinGroupDashboard_eu` - Group membership
-  `changeRole_eu` - Role management
-  `getLivestreamReportData_v2` - Analytics export

**Spark (Short Video) Functions**:

-  `createSpark`, `updateSpark`, `deleteSpark` - CRUD operations
-  `getSparksFeed` - Feed aggregation
-  `trackSparkEvents_v6` - User interactions
-  `getSparksAnalytics_v6` - Performance metrics

**Integration Functions**:

-  `stripeWebHook` - Payment processing
-  `fetchATSJobs_eu` - Job board sync
-  `syncUserToCustomerIO` - CRM sync
-  `customerIOWebhook` - Customer.io events

**Bundled Functions**:

-  `bundle-allFutureLivestreams` - Event bundle API
-  `bundle-pastYearLivestreams` - Historical data
-  `bundle-allSparksStats` - Analytics aggregation

#### Key Patterns

**Module Aliasing** for local development:

```typescript
ModuleAlias.addAliases({
   "@careerfairy/shared-lib": __dirname + "../../../shared-lib/src",
})
```

This allows using source directly during development without requiring dist builds.

**Environment Configuration**:

```typescript
setGlobalOptions({
   region: "europe-west1", // All functions deploy to EU
})
```

**Error Handling**: Consistent error responses with:

-  Admin SDK error logging
-  User-facing error messages
-  Sentry integration (via web errors)

---

### 5. `@careerfairy/seed-data`

**Purpose**: Development data generation for local testing  
**Build Tool**: tsc
**Dependencies**: faker.js for realistic data

#### Features

-  Generates fake users, livestreams, groups, sparks
-  Initializes Firestore with test data
-  Used during development and testing
-  Connects to local emulators

#### Used By

-  Development workflow (`npm run dev`)
-  Unit tests that need sample data
-  Demo environments

---

### 6. `@careerfairy/fetch-firestore-data`

**Purpose**: Export production Firestore data for local development  
**Build Tool**: tsc

#### Workflow

```
1. Production Firestore → Firebase Export
2. Script downloads export files
3. Data stored in emulatorData/fetched
4. Firebase emulator imports on startup
5. Local dev uses production-like data
```

#### Key Script

-  `production:export` - Downloads latest production backup
-  Enables realistic testing without production dependencies

---

### 7. `@careerfairy/firebase-scripts`

**Purpose**: Database migrations and maintenance scripts  
**Build Tool**: tsc

#### Examples

-  `backfill-fieldOfStudy` - Migrate field of study data
-  `queryAndSaveFieldAndLevelOfStudyToCsv` - Export reference data
-  Custom batch operations on Firestore

#### Execution

```bash
node ./dist/migrations/backfill-fieldOfStudy.js
```

---

### 8. Supporting Packages

**`config-jest`**: Custom Jest environment extending jsdom  
**`config-tsconfig`**: Shared TypeScript compiler options  
**`config-eslint`**: Shared ESLint rules  
**`utils-test`**: Testing utilities and mock factories

---

## Key Technologies

### Frontend Stack

| Technology        | Version | Purpose           |
| ----------------- | ------- | ----------------- |
| Next.js           | 13.5.6  | Web framework     |
| React             | 18.2.0  | UI library        |
| Material-UI       | 5.14.18 | Component library |
| Redux             | 4.2.1   | State management  |
| Reactfire         | 4.2.3   | Firebase hooks    |
| React Query / SWR | 2.2.0   | Data fetching     |
| Emotion           | 11.11.0 | CSS-in-JS         |
| Agora             | 4.18.0  | Real-time video   |
| Algolia           | 4.22.1  | Search            |
| Stripe            | 14.20.0 | Payments          |
| Mapbox            | 1.3.0   | Maps              |

### Mobile Stack

| Technology   | Version | Purpose            |
| ------------ | ------- | ------------------ |
| React Native | 0.74.5  | Cross-platform     |
| Expo         | 51.0.28 | Build & deployment |
| Expo Router  | 3.5.23  | Navigation         |
| Firebase     | 10.14.1 | Backend            |
| Customer.io  | 4.2.1   | Engagement         |
| Sentry       | 5.34.0  | Error tracking     |
| Branch       | 6.6.0   | Deep linking       |

### Backend Stack

| Technology            | Version        | Purpose                   |
| --------------------- | -------------- | ------------------------- |
| Firebase              | 10.12.5        | Database, Auth, Functions |
| Firebase Admin        | 13.3.0         | Admin operations          |
| Firebase Functions    | 6.3.2          | Serverless compute        |
| Google Cloud BigQuery | 7.9.0          | Data warehouse            |
| Mailgun / Postmark    | 8.2.1 / 3.0.18 | Email delivery            |
| Customer.io           | 4.1.1          | Marketing automation      |
| Agora Token           | 2.0.3          | Token generation          |

### Development Tools

| Tool                    | Purpose                      |
| ----------------------- | ---------------------------- |
| Turborepo               | Monorepo build orchestration |
| TypeScript              | Type safety                  |
| Jest                    | Unit testing                 |
| Playwright              | E2E testing                  |
| ESLint                  | Code linting                 |
| Prettier                | Code formatting              |
| Husky                   | Git hooks                    |
| Firebase Emulator Suite | Local development            |

---

## Data Flow Architecture

### 1. User Authentication Flow

```
Mobile/Web App
    ↓
Firebase Auth (Email + PIN)
    ↓
Firebase Custom Claims (adminGroups)
    ↓
CreateNewUserAccount Function
    ↓
Initialize userData in Firestore
Initialize userProfile document
Sync to Customer.io
    ↓
Redux Store (authenticated state)
```

### 2. Live Event Streaming Flow

```
Creator (Group Admin)
    ↓ (createLivestream via Functions)
Firestore livestreams collection
    ↓
NotifyUsersWhenLivestreamStarts Function (scheduled)
    ↓
Push Notifications → Users
Customer.io email events
    ↓
Attendees load RTC tokens (fetchAgoraRtcToken_v2)
    ↓
Agora servers (video/audio)
    ↓
Event data synced to BigQuery
```

### 3. Real-time Data Synchronization

```
Firebase Firestore (source of truth)
    ↓ (Reactfire subscription)
Web/Mobile React Components
    ↓ (Redux store/Context)
UI Re-renders
    ↓ (User interaction)
Firestore writes (validated by rules)
    ↓
Triggers onWrite/onCreate Functions
    ↓
Calculate stats, send notifications, sync to BigQuery
```

### 4. Search and Discovery Flow

```
User searches livestreams
    ↓
Web app queries Algolia index
Algolia returns ranked results
    ↓
Background Functions sync Firestore → Algolia
(fullIndexSync, searchIndex generators)
```

### 5. Payment Processing Flow

```
User initiates payment
    ↓
Stripe Checkout integration
    ↓
Stripe webhook → stripeWebHook Function
    ↓
Verify payment
Update userData (purchaseHistory)
Trigger access grants
    ↓
Firestore updated
    ↓
App refreshes user state
```

### 6. Analytics Flow

```
User events (streaming, clicks, videos)
    ↓ (custom tracking via trackSparkEvents, etc.)
BigQuery events table
    ↓
Background Functions aggregate stats
    ↓
Cache results in Firestore (cache/functions/analytics/{hash})
    ↓
Dashboard queries cache for analytics
```

### Data Consistency Guarantees

**Firestore Rules** (`firestore.rules`):

-  User can only read their own `userData`
-  Admin-only field changes blocked
-  Transaction-like constraints on counter increments
-  Group admins limited to their groups

**Function Atomicity**:

-  Multi-step operations wrapped in transactions
-  Rollback on partial failure
-  Consistent state on completion

**Real-time Subscriptions**:

-  Reactfire hooks auto-unsubscribe on unmount
-  Prevents memory leaks
-  Optimistic updates via Redux

---

## Build System

### Turborepo Pipeline

**Configuration** (`turbo.json`):

```json
{
   "pipeline": {
      "build": {
         "dependsOn": ["^build"], // Dependencies must build first
         "outputs": ["dist/**", ".next/**"] // Cache these outputs
      },
      "test": {
         "dependsOn": ["build"],
         "outputs": ["coverage/**"]
      },
      "dev": {
         "cache": false // Never cache dev runs
      }
   }
}
```

### Build Commands

```bash
# Build all workspaces (respecting dependencies)
npm run build

# Build specific packages
npm run build:packages      # All packages except apps
npm run build:functions     # Just Firebase Functions
npm run build:webapp        # Just Next.js app

# Development (hot reload)
npm run dev                 # Web + Functions + Emulators
npm run dev -w @careerfairy/webapp

# Native development
npm run native              # Expo dev server
npm run native:cache        # With caching
npm run native-build:prod   # Production build
```

### Dependency Graph

```
shared-lib
    ↓
functions, seed-data, firebase-scripts, shared-ui
    ↓
webapp, mobile
```

Turborepo ensures:

1. `shared-lib` builds first
2. Packages depending on it only build after
3. Build artifacts cached (20-50% faster rebuilds)

### Output Structure

After build:

```
packages/functions/dist/
  └── functions/src/index.js          # Compiled functions
packages/shared-lib/dist/
  ├── index.js                        # CommonJS
  ├── index.d.ts                      # Type definitions
  └── */                              # Domain modules
apps/web/.next/                       # Next.js build
```

---

## Testing Strategy

### 1. Unit Testing

**Framework**: Jest  
**Environment**: Node with jsdom (DOM simulation)  
**Coverage Target**: Critical paths (utilities, reducers, services)

#### Command

```bash
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
npm run test -- --coverage
```

#### Configuration

**Web App** (`apps/web/jest.config.ts`):

-  Roots: `apps/web` only
-  Transform: babel-jest with Next.js preset
-  Ignores: `.next`, `node_modules`, `public`, `tests/e2e`

**Functions** (limited coverage setup):

-  Run via: `npm run test -w @careerfairy/functions`
-  Test focus: Data transformation, validation

### 2. End-to-End Testing

**Framework**: Playwright  
**Target**: Web app critical user journeys  
**Emulators**: Firebase Emulator Suite (Auth, Firestore, Functions)

#### Setup

**Configuration** (`apps/web/playwright.config.ts`):

```typescript
{
  webServer: {
    command: 'npm run start:webapp', // Starts Next.js + emulators
    port: 3000
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry' // Screenshots on failure
  }
}
```

#### Running Tests

```bash
# Run all E2E tests (requires emulators running)
npm run test:e2e-webapp

# Debug mode with browser
npm run test:e2e-webapp-debug

# View results
npm run webapp:report
```

#### Test Coverage

-  User signup and email verification
-  Login flows
-  Livestream discovery and registration
-  Group admin operations
-  Payment flows (with Stripe test keys)
-  Real-time updates
-  Notification triggering

### 3. Integration Testing

**Strategy**:

-  Cloud Functions tested against emulator
-  Firestore rules validated in E2E tests
-  Firebase Auth emulator verifies signup/login

### 4. Pre-commit Hooks

**Husky** (`husky.json`):

```bash
# Pre-commit
prettier --write                    # Format code
eslint --max-warnings=0             # Lint with 0 tolerance

# Pre-push
npm run test                        # Run unit tests
```

Prevents commits with style issues or failing tests.

---

## Firebase Integration

### Project Structure

**Project ID**: `careerfairy-e1fd9`  
**Region**: `europe-west1` (GDPR compliance)

### Firestore Collections

**User Data** (`userData/{userEmail}`):

-  Profile information
-  Settings and preferences
-  Reward points
-  Purchase history
-  Custom data for features

**Livestreams** (`livestreams/{id}`):

-  Event metadata (title, description, date)
-  Streaming configuration (Agora channel)
-  Participant stats
-  Group associations
-  Recording information

**Groups** (`groups/{groupId}`):

-  Creator/company profile
-  Members and roles
-  Billing and plans
-  Analytics and reports

**Sparks** (`sparks/{id}`):

-  Short video metadata
-  Stats (views, engagement)
-  Group association
-  Transcoding status

**Custom Jobs** (`customJobs/{id}`):

-  Job postings (text, metadata)
-  Linked livestreams
-  Application tracking
-  Expiration

**Other Collections**:

-  `fieldsOfStudy`, `levelsOfStudy` (reference data)
-  `interests`, `highlights` (user attributes)
-  `pushNotifications` (notification definitions)
-  `cache/functions/analytics/{hash}` (cached analytics)

### Security Rules

**Rules File**: `firestore.rules` (890 lines)

#### Key Security Patterns

**User Authentication**:

```firestore
function isSignedIn() {
  return request.auth != null;
}

function isSignedInAndIsSameUser(userEmail) {
  return isSignedIn() && request.auth.token.email == userEmail;
}
```

**Admin Authorization**:

```firestore
function isCFAdmin() {
  return get(/databases/$(database)/documents/userData/$(request.auth.token.email))
    .data.isAdmin == true;
}

function isAdminOfGroup(groupId) {
  return groupId in request.auth.token.adminGroups.keys()
    || isCFAdmin();
}
```

**Data Validation**:

```firestore
function allowIncrementField(field) {
  return request.resource.data.diff(resource.data).affectedKeys().hasOnly([field])
    && request.resource.data[field] is int
    && request.resource.data[field] == resource.data[field] + 1;
}
```

#### Collection-level Access

```firestore
// Public read, admin write
match /fieldsOfStudy/{field} {
  allow read: if true;
  allow write: if isCFAdmin();
}

// User's own data
match /userData/{userId} {
  allow read: if isSignedInAndIsSameUser(userId) || isCFAdmin();
  allow write: if isSignedInAndIsSameUser(userId) || isCFAdmin();
}
```

### Cloud Storage Rules

**File**: `storage.rules`

Currently permissive (development):

```firestore
match /b/{bucket}/o {
  match /{allPaths=**} {
    allow read, write: if true;
  }
}
```

### Cloud Functions Configuration

**Deployment** (`firebase.json`):

```json
{
   "functions": {
      "source": "packages/functions",
      "predeploy": ["npm run lint:functions", "npm run build:functions"]
   },
   "hosting": {
      "rewrites": [
         {
            "source": "/bundle-*",
            "function": "bundle-*"
         }
      ]
   }
}
```

**Deployment Command**:

```bash
npm run build:functions && firebase deploy --only functions
```

Or specific function:

```bash
firelink deploy --only functions:createNewUserAccount
```

### Local Development with Emulators

**Ports**:

-  Auth: 9099
-  Firestore: 8080
-  Functions: 5001
-  Storage: 9199
-  Hosting: 5000
-  UI: 4000

**Startup**:

```bash
npm run dev
# Internally runs firebase emulators:start with data import
```

**Data Import/Export**:

-  Development data: `emulatorData/fetched/` (production backup)
-  Seeding: `seed-data` package generates test data
-  Export on exit: Auto-saved for next session

---

## Development Workflow

### Initial Setup

```bash
# Clone and install
git clone <repo>
cd careerfairy-monorepo
npm install

# Setup environment variables
cp apps/web/.env.local.example apps/web/.env.local
cp packages/functions/.env.local.example packages/functions/.env.local
# Fill in values from team

# Setup Git hooks
npm run prepare
```

### Daily Development

**Option 1: Full Stack with Emulators** (Recommended)

```bash
npm run dev
# Starts:
# - Next.js on http://localhost:3000
# - Firebase emulators on http://localhost:4000
# - Hot reloading for code changes
```

**Option 2: Web Only (Production Firebase)**

```bash
npm run dev -w @careerfairy/webapp
# Requires production credentials
```

**Option 3: Functions Development**

```bash
npm run dev -w @careerfairy/functions
# Starts emulators, watches for changes
```

**Option 4: Mobile Development**

```bash
npm run native
# Starts Expo dev server
# Scan QR code with Expo Go app
```

### Making Changes

**Web Feature**:

1. Create feature branch
2. Modify `apps/web/`
3. Test locally with `npm run dev`
4. Run tests: `npm run test`
5. Commit via Git (Husky hooks)

**Shared Logic**:

1. Modify `packages/shared-lib/`
2. Build: `npm run build:shared-lib`
3. Update web/mobile/functions to use
4. Test integration

**Firebase Function**:

1. Add to `packages/functions/src/`
2. Export in `index.ts`
3. Test with emulators: `npm run dev -w @careerfairy/functions`
4. Deploy: `firebase deploy --only functions:functionName`

### Database Management

**Fetch Production Data**:

```bash
npm run start -w @careerfairy/fetch-firestore-data
# Downloads latest production Firestore export
# Stores in emulatorData/fetched/
```

**Run Migrations**:

```bash
npm run build:scripts
npm run script -w @careerfairy/firebase-scripts -- migrations/backfill-fieldOfStudy.js
```

---

## Deployment Architecture

### Web App Deployment

**Platform**: Vercel (Next.js optimized)  
**Branch Protection**: PR checks required before merge to `develop`  
**Preview Deployments**: Auto-generated for PRs  
**Production**: Deployed from `develop` branch

**Environment Variables**:

-  Production Firebase config
-  API keys (Algolia, Stripe, Mapbox, etc.)
-  CDN URLs (ImageKit)

### Firebase Functions Deployment

**Deployment Command**:

```bash
npm run build:functions && firebase deploy --only functions
```

**Predeploy Hooks**:

-  Lint check: `npm run lint:functions`
-  Build: `npm run build:functions`

**Functions Runtime**: Node 22

### Firestore Rules Deployment

**Validation**:

-  Test with emulator
-  Review rule changes in PR

**Deploy**:

```bash
npm run deploy:rules
# Deploys firestore.rules and storage.rules
```

### Mobile App Deployment

**iOS/Android**: EAS Build  
**Profiles**:

-  **preview**: Development with expo-dev-client
-  **production**: Release builds to App Stores

**Command**:

```bash
npm run native-build:prod
# Builds and optionally uploads to App Stores
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/`):

**On Every PR**:

-  ESLint linting
-  Build verification
-  Unit tests
-  E2E tests (Playwright)
-  Test report upload

**On Merge to develop**:

-  Deploy to Vercel (preview + production)
-  Deploy Firebase Functions
-  Deploy Firestore Rules

**Manual Deployments**:

-  Mobile builds triggered manually via EAS
-  Function deployments via CLI

---

## Key Architectural Decisions & Patterns

### 1. **Monorepo Over Multirepo**

**Rationale**:

-  Maximum code reuse (shared-lib)
-  Unified versioning (no versioning complexity)
-  Single lint/test/build pipeline
-  Easier refactoring across boundaries

**Tradeoff**: Large repo, slower initial clone

### 2. **Firebase as Complete Backend**

**Rationale**:

-  No server infrastructure to manage
-  Real-time data synchronization
-  Built-in auth and security
-  Scalable to millions of concurrent users

**Tradeoff**: Vendor lock-in, limited custom logic

### 3. **TypeScript Everywhere**

**Rationale**:

-  Catch errors at compile time
-  Better IDE support and refactoring
-  Excellent for monorepo-wide changes
-  Shared types between web/mobile

**Tradeoff**: Slower development, more boilerplate

### 4. **Redux + Context + SWR Hybrid State**

**Rationale**:

-  Redux for global UI state
-  Context for feature-specific state
-  SWR/Reactfire for server state
-  Avoids over-engineering single source of truth

**Tradeoff**: Multiple state management patterns to learn

### 5. **Repositories + Presenters Pattern**

**Rationale**:

-  Repository: Isolates data access (Firestore)
-  Presenter: Transforms data for UI
-  Decouples UI from data structure
-  Easy to test and maintain

**Example**: Livestream repo fetches raw data, presenter formats for timeline view

### 6. **Turborepo for Incremental Builds**

**Rationale**:

-  Only rebuild changed packages
-  Caches outputs between runs
-  20-50% faster CI
-  Scales as monorepo grows

### 7. **Emulator-first Development**

**Rationale**:

-  No production data leaks
-  Instant reset between tests
-  Offline development possible
-  Matches production behavior

**Workflow**: Import production data snapshots, develop locally, deploy with confidence

---

## Domain Models Overview

### Livestream

-  **ID**: Unique identifier
-  **Metadata**: Title, description, date, duration
-  **Content**: Agora channel, recording ID, thumbnail
-  **Participants**: Group IDs, creator, attendees
-  **Stats**: View count, engagement, ratings
-  **State**: draft → scheduled → live → ended

### Group

-  **ID**: Unique identifier
-  **Profile**: Name, description, logo, website
-  **Members**: List with roles (admin, moderator, member)
-  **Plan**: Subscription tier, feature access
-  **Sparkings**: Published sparks
-  **Analytics**: Event performance, engagement

### User

-  **ID**: Auth UID + Email
-  **Profile**: Name, photo, bio, location
-  **Data**: Interests, education, career goals
-  **Engagement**: Watched events, sparks, rewards
-  **Settings**: Notifications, preferences

### Spark

-  **ID**: Unique identifier
-  **Content**: Video file, transcript, metadata
-  **Stats**: Views, engagement, watch time
-  **Group**: Created by which group
-  **Targeting**: Audience segment
-  **Status**: draft → published

### Custom Job

-  **ID**: Unique identifier
-  **Content**: Title, description, location, requirements
-  **Context**: Linked livestream, group
-  **Applications**: User applicants, status tracking
-  **Expiry**: Auto-delete after deadline

---

## Integration Points with External Services

| Service              | Integration                  | Purpose                         |
| -------------------- | ---------------------------- | ------------------------------- |
| **Agora**            | SDK + Token Functions        | Live video streaming            |
| **Algolia**          | Search API + Cloud Functions | Livestream/job search           |
| **Stripe**           | Webhook + Cloud Functions    | Payment processing              |
| **Customer.io**      | API + Webhook                | Marketing automation & tracking |
| **BigQuery**         | Cloud Functions              | Data warehouse & analytics      |
| **Mailgun/Postmark** | API + Cloud Functions        | Transactional email             |
| **Mapbox**           | Web SDK                      | Location search                 |
| **Facebook/TikTok**  | SDKs                         | Event tracking                  |
| **Sentry**           | Web SDK                      | Error tracking                  |
| **Merge API**        | Cloud Functions              | ATS integration                 |
| **Crisp Chat**       | Web SDK                      | Customer support                |
| **Imagekit**         | CDN                          | Media delivery                  |

---

## Common Development Patterns

### Using Firestore Data in Components

```typescript
// 1. Subscribe to data
const { data: livestream, isLoading } = useFirestoreDocumentData(
   doc(db, "livestreams", id)
)

// 2. Transform with presenter
const formatted = LivestreamPresenter.format(livestream)

// 3. Cache in Redux
dispatch(setCurrentLivestream(formatted))

// 4. Render with real-time updates
return <LivestreamCard data={formatted} />
```

### Calling Firebase Functions

```typescript
// 1. Get functions instance
const functions = useFunctions()

// 2. Call function
const result = await functions.httpsCallable("functionName")({
   param1: value1,
})

// 3. Handle response
if (result.data.success) {
   dispatch(setSuccess())
}
```

### Adding New Domain Entity

1. Create folder in `packages/shared-lib/src/{entity}/`
2. Define types: `{Entity}.ts`
3. Create Repository: `{Entity}Repository.ts`
4. Create Presenter: `{Entity}Presenter.ts`
5. Add validation: `schemas.ts` (Yup)
6. Export from `index.ts`
7. Use in web/mobile/functions

### Adding New Cloud Function

1. Create file: `packages/functions/src/{category}/{function}.ts`
2. Export from `index.ts`
3. Add function name to `FUNCTION_NAMES` in shared-lib
4. Test with emulator
5. Deploy with `firebase deploy`

---

## Performance Optimizations

### Web App

-  **Next.js Image Optimization**: Automatic responsive images
-  **Code Splitting**: Per-page bundles
-  **Bundle Analysis**: Check build size with `ANALYZE=true npm run build`
-  **Caching**: Redux + SWR for client-side caching

### Mobile App

-  **Lazy Loading**: Screens loaded on navigation
-  **WebView Optimization**: Single web instance in wrapper
-  **Bundle Size**: Tree-shaking unused code

### Firestore

-  **Indexed Queries**: Composite indexes for complex filters
-  **Subcollections**: Organize data hierarchically
-  **Rules Optimization**: Minimize get() calls in rules
-  **Caching**: Store computed results in `cache/` collection

### Cloud Functions

-  **Concurrent Execution**: Handle 1000s simultaneously
-  **Warm-up Calls**: `keepFunctionsWarm` prevents cold starts
-  **Batch Operations**: Group Firestore writes

---

## Troubleshooting Common Issues

### Emulators Not Starting

```bash
# Clear old data
rm -rf emulatorData/

# Kill hanging processes
npm run kill-emulators

# Start fresh
npm run dev
```

### Module Not Found Errors

-  Check `packages.json` workspaces include the package
-  Verify `npm install` was run
-  Clear node_modules: `rm -rf node_modules && npm install`

### Firebase Function Timeouts

-  Check function memory/timeout settings
-  Use batch operations for large updates
-  Stream data instead of loading everything

### Type Errors After shared-lib Changes

```bash
# Rebuild shared-lib
npm run build:shared-lib

# Rebuild dependent packages
npm run build:functions
npm run build:webapp
```

---

## Resources

-  **Setup Guide**: (Notion link in README)
-  **Firebase Docs**: https://firebase.google.com/docs
-  **Next.js Docs**: https://nextjs.org/docs
-  **React Native Docs**: https://reactnative.dev/docs/getting-started
-  **Turborepo Docs**: https://turbo.build/repo/docs

---

## Document Metadata

-  **Last Updated**: October 28, 2025
-  **Coverage**: Very thorough (monorepo architecture, all major systems)
-  **Audience**: New team members, architecture review, contributor guidelines
-  **Next Review**: Quarterly or after major architectural changes

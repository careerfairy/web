# Deployment Operations

This skill provides comprehensive guidance for deploying CareerFairy applications and infrastructure.

## Overview

CareerFairy uses multiple deployment platforms:

-  **Web App**: Vercel (Next.js optimized hosting)
-  **Firebase Functions**: Google Cloud Functions (Europe West 1)
-  **Mobile Apps**: EAS Build → App Store / Play Store
-  **Firestore Rules**: Firebase Console

## Web App Deployment (Vercel)

### Automatic Deployments

**On Every PR:**

-  Preview deployment created automatically
-  Unique URL for testing: `careerfairy-pr-123.vercel.app`
-  Runs build checks and tests via GitHub Actions

**On Merge to `develop`:**

-  Production deployment triggered
-  Deploys to `app.careerfairy.com` (or configured domain)
-  Runs full CI/CD pipeline

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

**Required for Production:**

-  `NEXT_PUBLIC_FIREBASE_*` - Firebase config (public)
-  `NEXT_PUBLIC_ALGOLIA_*` - Algolia search keys
-  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
-  `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox token
-  `NEXT_PUBLIC_AGORA_APP_ID` - Agora app ID
-  Other API keys as needed

**Setting Variables:**

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add variables for `Production`, `Preview`, and `Development` environments
3. Redeploy to apply changes

### Build Configuration

Vercel automatically detects Next.js and uses:

-  Framework Preset: Next.js
-  Build Command: `npm run build` (or custom in package.json)
-  Output Directory: `.next`
-  Install Command: `npm install`

### Troubleshooting Vercel Deployments

**Build fails:**

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in package.json
3. Test build locally: `npm run build`
4. Check for environment variable issues

**App works locally but not on Vercel:**

1. Check environment variables are set correctly
2. Verify API endpoints are accessible from Vercel's IP range
3. Check Vercel function logs (if using API routes)

## Firebase Functions Deployment

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Select project
firebase use careerfairy-e1fd9
```

### Deploy All Functions

```bash
# Build first
npm run build:functions

# Deploy
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:createNewUserAccount
firebase deploy --only functions:fetchAgoraRtcToken_v2
```

### Deploy Multiple Functions

```bash
firebase deploy --only functions:func1,functions:func2
```

### Predeploy Checks

Firebase automatically runs (configured in `firebase.json`):

1. `npm run lint:functions` - Linting
2. `npm run build:functions` - TypeScript compilation

If either fails, deployment is cancelled.

### Function Configuration

**Runtime:** Node 22
**Region:** europe-west1 (for GDPR compliance)
**Memory:** Default 256MB (configurable per function)
**Timeout:** Default 60s for Gen 2 (configurable up to 540s)

**Example function config:**

```typescript
export const myFunction = onCall(
   {
      region: "europe-west1",
      timeoutSeconds: 300,
      memory: "1GiB",
   },
   async (request) => {
      // ...
   }
)
```

### Environment Variables for Functions

**Setting Secrets:**

```bash
# Set secret
firebase functions:secrets:set SECRET_NAME

# View secrets
firebase functions:secrets:access SECRET_NAME

# Use in code
import { defineSecret } from "firebase-functions/params"
const apiKey = defineSecret("SECRET_NAME")
```

**Setting Config (non-secret):**

```bash
# Set config
firebase functions:config:set api.key="value"

# Get config
firebase functions:config:get

# Use in code
import * as functions from "firebase-functions"
const apiKey = functions.config().api.key
```

### Monitoring Functions

**View Logs:**

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only createNewUserAccount

# Tail logs (live)
firebase functions:log --only createNewUserAccount --tail
```

**Metrics:**

-  Firebase Console → Functions → Select function → Metrics tab
-  Shows invocations, execution time, memory usage, errors

### Rollback Functions

```bash
# List previous versions
firebase functions:list

# Rollback specific function
# (No direct rollback - redeploy previous code version)
git checkout <previous-commit>
npm run build:functions
firebase deploy --only functions:functionName
git checkout develop
```

## Firestore Rules Deployment

### Deploy Rules

```bash
# Deploy both Firestore and Storage rules
npm run deploy:rules

# Or individually
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Testing Rules

**Before deployment:**

```bash
# Start emulators
npm run dev

# Run Firestore rules tests (if you have them)
firebase emulators:exec "npm test"
```

**In Firebase Console:**

1. Go to Firestore → Rules → Rules Playground
2. Test specific rules with mock data
3. Verify expected behavior

### Rules Best Practices

1. **Test in emulator first** - Never deploy untested rules
2. **Review changes** - Rules control data security
3. **Gradual rollout** - Test with limited users first (if possible)
4. **Monitor logs** - Check for unexpected denials after deployment

### Security Considerations

Current rules file is 890 lines - ensure:

-  User data is properly scoped
-  Admin checks are correct
-  Group permissions are enforced
-  No accidental public write access

## Mobile App Deployment (EAS)

### Prerequisites

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Link project (if not done)
eas build:configure
```

### Build Profiles

Defined in `eas.json`:

-  **preview**: Development builds with expo-dev-client
-  **development**: Development builds for testing
-  **staging**: Pre-production builds
-  **production**: Production release builds

### Building for iOS

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios

# Auto-submit to App Store
eas build --profile production --platform ios --auto-submit
```

**Requirements:**

-  Apple Developer account
-  Certificates and provisioning profiles (EAS manages automatically)
-  App Store Connect API key (for auto-submit)

### Building for Android

```bash
# Development build
eas build --profile development --platform android

# Production build
eas build --profile production --platform android

# Auto-submit to Play Store
eas build --profile production --platform android --auto-submit
```

**Requirements:**

-  Google Play Developer account
-  Keystore (EAS manages automatically)
-  Service account key (for auto-submit)

### Build for Both Platforms

```bash
eas build --profile production --platform all
```

### Submit to Stores

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

### Update Without Full Rebuild (OTA)

For JavaScript-only changes (no native code changes):

```bash
# Publish update
eas update --branch production --message "Fix button styling"

# Users get update on next app restart
```

### Monitoring Builds

1. Check build status: https://expo.dev/accounts/[your-account]/projects/careerfairy
2. Download builds from EAS dashboard
3. View build logs if builds fail

### Mobile Release Checklist

-  [ ] Test build with `preview` or `staging` profile
-  [ ] Bump version in `app.json`
-  [ ] Update release notes
-  [ ] Build with `production` profile
-  [ ] Test downloaded build on physical device
-  [ ] Submit to stores
-  [ ] Monitor for crashes (Sentry)

## CI/CD Pipeline (GitHub Actions)

### Current Workflows

Located in `.github/workflows/`:

**On Every PR:**

-  ESLint linting
-  TypeScript type checking
-  Build verification (all packages)
-  Unit tests
-  E2E tests (Playwright) on web app
-  Test report upload

**On Merge to `develop`:**

-  All PR checks
-  Deploy to Vercel (automatic via Vercel integration)
-  Deploy Firebase Functions (optional, usually manual)
-  Deploy Firestore Rules (optional, usually manual)

### Manual Workflow Triggers

Some workflows can be triggered manually:

1. Go to GitHub → Actions tab
2. Select workflow
3. Click "Run workflow"
4. Select branch and parameters

### Secrets Configuration

**GitHub Repository Secrets:**

-  `FIREBASE_TOKEN` - For Firebase deployments
-  `VERCEL_TOKEN` - For Vercel deployments
-  Other API keys as needed

**Setting Secrets:**

1. GitHub → Settings → Secrets and variables → Actions
2. Add new repository secret
3. Use in workflow: `${{ secrets.SECRET_NAME }}`

## Deployment Checklist

### Before Any Deployment

-  [ ] All tests passing
-  [ ] Code reviewed and approved
-  [ ] Changelog updated (if applicable)
-  [ ] Breaking changes documented
-  [ ] Staging tested (if available)

### Web Deployment

-  [ ] Environment variables set in Vercel
-  [ ] Build succeeds locally
-  [ ] Preview deployment tested
-  [ ] Production deployment reviewed

### Functions Deployment

-  [ ] Functions build successfully
-  [ ] Tested in emulator
-  [ ] No breaking changes to existing functions
-  [ ] Function names correct (typos = new function!)
-  [ ] Secrets/config set in Firebase

### Rules Deployment

-  [ ] Rules tested in emulator
-  [ ] Security implications reviewed
-  [ ] No accidental public access
-  [ ] Backward compatible with current clients

### Mobile Deployment

-  [ ] Version bumped in `app.json`
-  [ ] Tested on iOS and Android devices
-  [ ] No native dependency changes (or rebuild native layer)
-  [ ] Release notes prepared
-  [ ] Screenshots updated (if needed)

## Rollback Procedures

### Web App (Vercel)

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "Promote to Production"
4. Previous version is now live

### Firebase Functions

```bash
# Redeploy previous version from git
git log --oneline                    # Find working commit
git checkout <commit-hash>
npm run build:functions
firebase deploy --only functions
git checkout develop
```

### Firestore Rules

```bash
# Firebase Console → Firestore → Rules
# View history, select previous version
# Click "Publish" to restore
```

### Mobile App

**Cannot rollback after store approval.**

Options:

1. Submit new build with fix (fastest)
2. Remove app from stores temporarily (extreme)
3. Use OTA updates if JavaScript-only issue

## Monitoring Production

### Web App

-  **Vercel Analytics**: Dashboard → Analytics
-  **Sentry**: Error tracking and performance monitoring
-  **Firebase Analytics**: User behavior tracking

### Functions

-  **Firebase Console**: Functions → Logs and metrics
-  **Sentry**: Function error tracking
-  **Cloud Logging**: Full GCP logs

### Mobile App

-  **Expo Analytics**: Basic usage stats
-  **Sentry**: Crash reporting
-  **Customer.io**: User engagement tracking
-  **Firebase Analytics**: Event tracking

## Getting Help

### Deployment Issues

1. Check deployment logs (Vercel, Firebase, EAS)
2. Verify environment variables and secrets
3. Test locally with production config
4. Review recent changes (git diff)
5. Ask team in Slack/Discord with logs

### Platform Documentation

-  **Vercel**: https://vercel.com/docs
-  **Firebase**: https://firebase.google.com/docs
-  **Expo/EAS**: https://docs.expo.dev/build/introduction
-  **GitHub Actions**: https://docs.github.com/en/actions

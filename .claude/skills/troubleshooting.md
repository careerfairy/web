# Troubleshooting Common Issues

This skill provides solutions to common problems encountered when developing in the CareerFairy monorepo.

## Firebase Emulators Issues

### Emulators Not Starting

**Symptoms:**

-  Emulators hang on startup
-  Port already in use errors
-  Connection refused errors

**Solutions:**

```bash
# 1. Clear old emulator data
rm -rf emulatorData/

# 2. Kill hanging processes
npm run kill-emulators
# Or manually:
lsof -ti:4000,5001,8080,9099,9199 | xargs kill -9

# 3. Start fresh
npm run dev
```

### Emulator Data Not Loading

**Symptoms:**

-  Firestore appears empty in emulator
-  Expected data missing

**Solutions:**

1. Check if data exists in `emulatorData/fetched/` or `emulatorData/`
2. Manually import data:
   ```bash
   firebase emulators:start --import=./emulatorData/fetched
   ```
3. Fetch fresh production data:
   ```bash
   npm run start -w @careerfairy/fetch-firestore-data
   ```
4. Generate seed data:
   ```bash
   npm run build:seed-data
   npm run dev
   ```

### Emulator Functions Not Updating

**Symptoms:**

-  Function changes not reflecting
-  Old function code still running

**Solutions:**

```bash
# 1. Rebuild functions
npm run build:functions

# 2. Restart emulators
# Ctrl+C to stop, then
npm run dev -w @careerfairy/functions
```

## Build & Dependency Issues

### Module Not Found Errors

**Symptoms:**

```
Cannot find module '@careerfairy/shared-lib'
Module not found: Can't resolve 'package-name'
```

**Solutions:**

1. **Check workspace configuration:**

   ```bash
   # Verify package.json includes the workspace
   cat package.json | grep workspaces
   ```

2. **Reinstall dependencies:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build dependencies first:**

   ```bash
   npm run build:shared-lib
   npm run build:packages
   ```

4. **Check package.json** - Ensure dependency is listed in the consuming package

### Type Errors After shared-lib Changes

**Symptoms:**

```
Type 'X' is not assignable to type 'Y'
Property 'newField' does not exist on type 'Livestream'
```

**Solutions:**

```bash
# 1. Rebuild shared-lib (generates new .d.ts files)
npm run build:shared-lib

# 2. Rebuild dependent packages
npm run build:functions
npm run build:webapp

# 3. Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Build Fails with "Out of Memory"

**Symptoms:**

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solutions:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json script:
"build": "NODE_OPTIONS=--max-old-space-size=4096 turbo run build"
```

## Firebase Functions Issues

### Function Timeouts in Production

**Symptoms:**

-  Function times out after 60s (Gen 2 default)
-  Large data processing fails

**Solutions:**

1. **Increase timeout** in function definition:

   ```typescript
   export const myFunction = onCall(
      {
         timeoutSeconds: 300, // 5 minutes max
         memory: "1GiB", // Increase if needed
      },
      async (request) => {
         // ...
      }
   )
   ```

2. **Use batch operations:**

   ```typescript
   // Instead of individual writes
   const batch = db.batch()
   items.forEach((item) => {
      batch.set(ref, item)
   })
   await batch.commit()
   ```

3. **Stream data** instead of loading everything:
   ```typescript
   // Process in chunks
   const query = db.collection("items").limit(500)
   // Process, then get next batch
   ```

### Function Not Found / 404 Error

**Symptoms:**

```
Function not found: myFunction
404: The requested URL was not found
```

**Solutions:**

1. **Check export in index.ts:**

   ```typescript
   export { myFunction } from "./api/myFunction"
   ```

2. **Verify deployment:**

   ```bash
   firebase functions:list
   # Should show your function
   ```

3. **Rebuild and redeploy:**

   ```bash
   npm run build:functions
   firebase deploy --only functions:myFunction
   ```

4. **Check region** - Ensure client calls correct region:
   ```typescript
   connectFunctionsEmulator(functions, "localhost", 5001)
   // Or in production:
   const functions = getFunctions(app, "europe-west1")
   ```

### Firebase Admin Permissions Error

**Symptoms:**

```
Insufficient permissions
User does not have permission to access this resource
```

**Solutions:**

1. **Check Firestore rules** in `firestore.rules`
2. **Use Admin SDK** in functions (bypasses rules):
   ```typescript
   import { getFirestore } from "firebase-admin/firestore"
   const db = getFirestore() // Admin access
   ```
3. **Verify service account** has correct permissions in GCP Console

## Testing Issues

### E2E Tests Failing

**Symptoms:**

-  Tests timeout
-  Elements not found
-  Unexpected state

**Solutions:**

1. **Ensure clean state:**

   ```bash
   # Clear emulator data before tests
   rm -rf emulatorData/
   npm run test:e2e-webapp
   ```

2. **Check emulator status:**

   ```bash
   # Emulators should start automatically, but verify:
   curl http://localhost:4000
   ```

3. **Increase timeouts** in `playwright.config.ts`:

   ```typescript
   use: {
     actionTimeout: 10000, // 10s for actions
     navigationTimeout: 30000, // 30s for page loads
   }
   ```

4. **Debug visually:**
   ```bash
   npm run test:e2e-webapp-debug
   # Opens browser, pauses on failures
   ```

### Jest Tests Fail with "Unexpected Token"

**Symptoms:**

```
SyntaxError: Unexpected token 'export'
Cannot use import statement outside a module
```

**Solutions:**

1. **Check jest.config.ts transform:**

   ```typescript
   transform: {
     "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
   }
   ```

2. **Add to transformIgnorePatterns:**
   ```typescript
   transformIgnorePatterns: ["node_modules/(?!(module-that-needs-transform)/)"]
   ```

## Next.js Issues

### Page Not Found (404)

**Symptoms:**

-  Expected page returns 404
-  Catch-all route not working

**Solutions:**

1. **Check file name convention:**

   -  Dynamic routes: `[id].tsx`
   -  Catch-all: `[...slug].tsx`
   -  Optional catch-all: `[[...slug]].tsx`

2. **Verify page is in `pages/` directory**

3. **Check `.next/` build output:**

   ```bash
   ls .next/server/pages
   ```

4. **Clear Next.js cache:**
   ```bash
   rm -rf apps/web/.next
   npm run dev
   ```

### Environment Variables Not Loading

**Symptoms:**

-  `process.env.NEXT_PUBLIC_*` is undefined
-  API keys not found

**Solutions:**

1. **Check prefix** - Client variables MUST start with `NEXT_PUBLIC_`:

   ```bash
   # ❌ Won't work on client
   API_KEY=abc123

   # ✅ Works on client
   NEXT_PUBLIC_API_KEY=abc123
   ```

2. **Restart dev server** after changing `.env.local`

3. **Verify file exists:**

   ```bash
   ls apps/web/.env.local
   ```

4. **Check for typos** in variable names

## React/Reactfire Issues

### Infinite Re-render Loop

**Symptoms:**

```
Maximum update depth exceeded
Too many re-renders
```

**Solutions:**

1. **Memoize callbacks:**

   ```typescript
   // ❌ Creates new function each render
   onClick={() => handleClick(id)}

   // ✅ Memoized callback
   const handleClickMemo = useCallback(() => handleClick(id), [id])
   ```

2. **Fix dependency arrays:**

   ```typescript
   useEffect(() => {
      // ...
   }, [stable, dependencies, only])
   ```

3. **Check Firestore subscriptions:**
   ```typescript
   // Ensure query reference is stable
   const queryRef = useMemo(
      () => query(collection(db, "items"), where("status", "==", "active")),
      []
   )
   const { data } = useFirestoreCollectionData(queryRef)
   ```

### Firestore Query Not Updating

**Symptoms:**

-  Data changes in console but not in UI
-  Stale data displayed

**Solutions:**

1. **Check subscription** is active:

   ```typescript
   const { data, status } = useFirestoreDocumentData(docRef)
   console.log(status) // Should be "success", not "loading"
   ```

2. **Verify ref stability:**

   ```typescript
   // ❌ Creates new ref each render
   const ref = doc(db, "items", id)

   // ✅ Stable ref
   const ref = useMemo(() => doc(db, "items", id), [id])
   ```

3. **Clear Redux state** if caching old data:
   ```typescript
   dispatch(clearCache())
   ```

## Git & Version Control Issues

### Husky Hooks Failing

**Symptoms:**

-  Commit blocked by pre-commit hook
-  ESLint errors prevent commit

**Solutions:**

1. **Fix linting errors:**

   ```bash
   npm run lint:fix
   ```

2. **Skip in emergency only:**

   ```bash
   git commit --no-verify -m "emergency fix"
   ```

3. **Reinstall hooks:**
   ```bash
   npm run prepare
   ```

### Merge Conflicts in package-lock.json

**Symptoms:**

-  Conflicts in `package-lock.json` after merge

**Solutions:**

```bash
# 1. Take one version (usually yours or theirs)
git checkout --ours package-lock.json
# or
git checkout --theirs package-lock.json

# 2. Regenerate lock file
rm package-lock.json
npm install

# 3. Commit
git add package-lock.json
git commit -m "fix: resolve package-lock conflicts"
```

## Mobile/Expo Issues

### Expo App Won't Connect to Dev Server

**Symptoms:**

-  QR code scans but app won't load
-  Connection timeout

**Solutions:**

1. **Check network** - Phone and computer must be on same WiFi

2. **Try tunnel mode:**

   ```bash
   npm run native -- --tunnel
   ```

3. **Use direct IP:**

   ```bash
   npm run native -- --host 192.168.1.x
   ```

4. **Clear Expo cache:**
   ```bash
   npm run native -- --clear
   ```

### Native Module Not Found

**Symptoms:**

```
Invariant Violation: Native module cannot be null
Module 'ExpoModuleName' is not available
```

**Solutions:**

1. **Rebuild app:**

   ```bash
   npx expo prebuild --clean
   ```

2. **Check package.json** - Module installed?

3. **Sync dependencies:**
   ```bash
   npx expo install --fix
   ```

## Getting More Help

### Resources

-  **Setup Guide**: Check team Notion or README
-  **Firebase Docs**: https://firebase.google.com/docs
-  **Next.js Docs**: https://nextjs.org/docs
-  **React Native Docs**: https://reactnative.dev/docs
-  **Turborepo Docs**: https://turbo.build/repo/docs
-  **Expo Docs**: https://docs.expo.dev

### Debugging Tips

1. **Check logs:**

   -  Web: Browser DevTools Console
   -  Functions: Firebase Emulator UI → Functions tab
   -  Mobile: Expo DevTools (press 'j' in terminal)

2. **Isolate the problem:**

   -  Minimal reproduction
   -  Test in isolation
   -  Bisect changes (git bisect)

3. **Search existing issues:**

   -  Check repo issues/PRs
   -  Search Stack Overflow
   -  Check official docs

4. **Ask for help:**
   -  Team Slack/Discord
   -  Include error message, steps to reproduce
   -  Share relevant code snippet

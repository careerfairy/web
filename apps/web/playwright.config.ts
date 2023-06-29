import type { PlaywrightTestConfig } from "@playwright/test"
import { devices } from "@playwright/test"

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * Global Playwright config
 *
 * GitHub Actions CI runners are slower than our laptops so we need to increase the tests timeouts
 *
 * It's beneficial to have bigger timeouts on CI than short ones that fail ofter and cause retries
 * because when retries happen they increase the tests runtime a lot
 *
 * On our laptops, the timeouts should be lowered so that tests can fail faster
 */
const config: PlaywrightTestConfig = {
   testDir: "./tests/e2e",
   testIgnore: "**/streaming/test**",
   /* Maximum time one test can run for. */
   timeout: process.env.CI ? 60 * 1000 : 30 * 1000,
   // Increase the number of workers on CI (GitHub runners have 2 cores), use default locally (cpus/2)
   workers: 1,
   expect: {
      /**
       * Maximum time expect() should wait for the condition to be met.
       * For example in `await expect(locator).toHaveText();`
       */
      timeout: process.env.CI ? 25 * 1000 : 5 * 1000,
   },
   /* Fail the build on CI if you accidentally left test.only in the source code. */
   forbidOnly: !!process.env.CI,
   /* Retry on CI only */
   retries: process.env.CI ? 2 : 0,
   /* Opt out of parallel tests on CI. */
   // workers: process.env.CI ? 1 : undefined,
   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
   reporter: "html",
   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
   use: {
      /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
      actionTimeout: 0,
      /* Base URL to use in actions like `await page.goto('/')`. */
      // baseURL: 'http://localhost:3000',

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: "on-first-retry",
      screenshot: "only-on-failure",
      video: "retain-on-failure",
   },
   globalTeardown: "./playwright.teardown",

   /* Configure projects for major browsers */
   projects: [
      {
         name: "chromium",
         use: {
            ...devices["Desktop Chrome"],
            permissions: ["camera", "microphone"],
            launchOptions: {
               // https://webrtc.org/getting-started/testing
               args: [
                  "--use-fake-ui-for-media-stream", // avoids the need to grant camera/microphone permissions
                  "--use-fake-device-for-media-stream", // feeds a test pattern to getUserMedia() instead of live camera input
                  "--mute-audio",
               ],
            },
         },
      },
      {
         name: "firefox",
         use: {
            ...devices["Desktop Firefox"],
            launchOptions: {
               args: ["--use-test-media-devices", "--quiet"],
               firefoxUserPrefs: {
                  "media.navigator.streams.fake": true,
                  "media.navigator.permission.disabled": true,
               },
            },
         },
      },
      {
         name: "webkit",
         use: {
            ...devices["Desktop Safari"],
         },
      },
   ],

   /* Folder for test artifacts such as screenshots, videos, traces, etc. */
   outputDir: "./test-results",

   /* Run your local dev server before starting the tests */
   webServer: {
      command: `npx firebase emulators:exec "npm run start -w @careerfairy/webapp" ${
         process.env.CI ? "" : "--ui"
      } --only auth,firestore,functions,storage`,
      cwd: "../../",
      env: {
         FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
         FIREBASE_STORAGE_EMULATOR_HOST: "localhost:9199",
         FIRESTORE_EMULATOR_HOST: "localhost:8080",
         NEXT_PUBLIC_FIREBASE_EMULATORS: "true",
         APP_ENV: "test",
      },
      port: 3000,
      // emulators need some time to boot
      timeout: 40 * 1000,
   },
}

export default config

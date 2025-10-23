# CareerFairy Apps

Monorepo with all the apps, managed by pnpm workspaces and turborepo.

### Requirements

-  `node` (v22.10.0 - specified in .nvmrc)
-  `pnpm` (>=v9.0.0)

Check our [Development Environment Setup Guide](https://www.notion.so/Development-Environment-Setup-Guide-a5f414de756245aabde5a7d4e9a48350) article for instructions on how to setup your machine.

## Setup root folder

Since we're using pnpm workspaces, only run `pnpm` commands on the root folder. There will be a shared `node_modules`
folder at the root folder for all the apps/packages.

```sh
# install deps for all workspaces (app/*, packages/*)
pnpm install

# runs only once after cloning, will setup husky hooks
pnpm run prepare
```

Make a copies in place for the `env.local.example` file for the [web app](./apps/web/.env.local.example) and the [functions package](./packages/functions/.env.local.example) and rename them to `env.local`. Ask your colleagues for the values of the environment values.
For ImageKit check [this section](#configure-environment-variables).

## PNPM Commands

```sh
# Builds all the workspaces
pnpm run build

# Fetch production backup (downloads from gs://careerfairy-backup/fetched)
# See packages/fetch-firestore-data/README.md for details
pnpm run fetch-data

# Dev environment - requires TWO TERMINALS:

# Terminal 1: Start Firebase emulators (requires 10GB memory)
# Imports data from emulatorData/fetched and exports on Ctrl+C
pnpm emulators

# Terminal 2: Start all dev servers with hot reload
# Web app + TypeScript watchers
pnpm dev

# Installing a dependency, you need to specify the workspace
pnpm add --filter @careerfairy/webapp lodash
```

### Removing a Package

To remove a dependency from a specific workspace, use the following command, specifying the workspace (using `--filter`) and the package name you want to remove:

```sh
# Remove lodash from the webapp workspace
pnpm remove --filter @careerfairy/webapp lodash
```

For changes to workspace packages themselves (for example, deleting an entire app or package):

1. Delete the package folder from the relevant location (e.g., `apps/<name>` or `packages/<name>`).
2. Remove its reference from the `pnpm-workspace.yaml` if necessary.
3. Run `pnpm install` at the root to clean up the workspace dependencies.
4. Search your codebase for any remaining imports/usages of the removed package.

## Existing Git Hooks

-  Pre-commit: will run prettier formater
-  Pre-push: will run unit tests

# Web App (NextJS)

## Development

```sh
pnpm run dev --filter @careerfairy/webapp
```

## Testing

There are two types of tests that you can run

-  Unit Tests with Jest:

```sh
pnpm run test
# To run all normal unit test files located in apps/packages that have them
```

-  End-To-End Tests with Playwright:

```sh
# Run all E2E tests
pnpm run test:e2e-webapp

# Run a specific test file
pnpm run test:e2e-webapp -- tests/e2e/pages/admin/livestreams.spec.ts

# Run by filename or test name pattern (using -g flag)
pnpm run test:e2e-webapp -- -g "livestreams.spec.ts"
pnpm run test:e2e-webapp -- -g "draft livestream"

# Run on a specific browser
pnpm run test:e2e-webapp -- --project=firefox

# Debug mode (opens Playwright inspector)
pnpm run test:e2e-webapp-debug
```

Upon test completion or failure a report html folder is generated which can be accessed
in `./apps/web/playwright-report`.

If the test had failed, the report will include screenshots and video recordings of
what produced the failure as seen below:
![failed report example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-example.png?alt=media&token=bb91ecc7-d4f1-457e-a1fc-c5b811dad706)

There are two ways in which you can open up the report:

-  Running the root script `pnpm run webapp:report`
-  Running the index.html file within `./apps/web/playwright-report`

## CI

The CI Pipeline now runs on every push/pull request and test results are always uploaded through a GitHub action and are
stored in a zip file attached to the pipeline as seen below:
![uploaded report folder example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-upload-example.png?alt=media&token=51f95e0d-26aa-4e49-b724-515c6991a74a)

# Firebase Functions

## Build

```sh
pnpm run build --filter @careerfairy/functions
# or pnpm run build
```

## Deploy a function

```sh
cd packages/functions
pnpm exec firelink deploy --only functions:slackHandleInteractions
```

## Deploy a bundle

```sh
cd packages/functions
pnpm exec firelink deploy --only functions:bundle-pastYearLivestreams
```

When adding new bundles, it's likely that you'd want to ensure the Firebase Hosting mappings are also updated

```sh
cd packages/functions
pnpm exec firebase deploy --only hosting
```

To verify the deployment of your bundle and ensure it is mapped correctly, visit: https://functions.careerfairy.io/bundle-pastYearLivestreams

## Start the firebase emulators with data

**Before first run:** You need to export production data to create a "fetched" backup (only one team member needs to do this):

```sh
pnpm run fetch-data:export  # Creates backup at gs://careerfairy-backup/fetched (~5 min)
```

**Then download and import the backup:**

```sh
pnpm run fetch-data  # Downloads backup to emulatorData/fetched
```

For more details, see `packages/fetch-firestore-data/README.md`

### Emulator UI

When running `pnpm emulators` the Firebase Emulator UI will be available at:

http://localhost:4000/

**Important:** Press Ctrl+C once to stop emulators. Wait for "Export complete" message to ensure data is saved.

## Firestore Rules

Update the `firestore.rules` file with your new rules, test them using the local emulators.

Create a Pull Request with the new changes, and only after approval, should you deploy them using `pnpm run deploy:rules`.

### Run E2E tests on a linux docker container

Useful to find test flaws that appear during CI.
Adjust the docker resources to match the CI runners specs (2cpu, 7GB memory).

```sh
# Build the image first (matches CI: Node 22, Playwright v1.49.0, ubuntu-22.04)
docker build -t careerfairy-tests -f apps/web/Dockerfile.test .

# Run all tests
docker run -p 9323:9323 -p 8080:8080 -p 5001:5001 -p 9099:9099 -p 9199:9199 \
  -e NEXT_PUBLIC_UNIQUE_WORKFLOW_ID="local-test" \
  careerfairy-tests

# Run specific shard (e.g., shard 3 of 5)
docker run -p 9323:9323 -p 8080:8080 -p 5001:5001 -p 9099:9099 -p 9199:9199 \
  -e NEXT_PUBLIC_UNIQUE_WORKFLOW_ID="local-test-shard-3" \
  careerfairy-tests -- --shard=3/5

# Run specific test with Firefox
docker run -p 9323:9323 -p 8080:8080 -p 5001:5001 -p 9099:9099 -p 9199:9199 \
  -e NEXT_PUBLIC_UNIQUE_WORKFLOW_ID="local-test-firefox" \
  careerfairy-tests -- --project=firefox -g "Create a draft livestream from the main page"
```

### Emulator Functions - Sending Emails

There are functions that try to send emails, but when running the emulators locally, both Postmark and Mailgun providers
are setup to use their sandbox environments.

-  Mailgun: Emails are only sent to whitelisted addresses on their sandbox environment.
-  Postmark: You need to check the outbound emails on their sandbox environment dashboard.

# Firebase Scripts

## Run the script

This will execute the script using the firestore emulator db.

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=<path-to-script>
```

In order to run the script on production you need to add a flag `useProd=true` to the command.

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- useProd=true scriptPath=<path-to-script>
```

# ImageKit Setup

We use ImageKit for real-time video optimization and transformation. Each developer is required to set up their own ImageKit account for local development. Separate ImageKit IDs are also used for the testing and production environments.

### Create Your Own ImageKit Account

1. Navigate to [ImageKit.io Registration](https://imagekit.io/registration/) and sign up for a new account.
2. During setup, select Frankfurt (Europe) as the region.
3. Once registered, go to the [Dashboard](https://imagekit.io/dashboard/external-storage) and click **+Add New** as shown in the image below:
   ![Dashboard Screenshot](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2FScreenshot%20from%202023-08-31%2011-39-47.png?alt=media&token=a45777ec-ad2f-4cc4-83ba-f1404f71f038)
4. Complete the following fields:
   1. **Origin name\***: Enter `Firebase Storage`.
   2. **Origin type\***: Select `Web Folder - HTTP(S) server and Magento, Shopify, Wordpress, etc.`.
   3. **Base URL\***: Enter `https://firebasestorage.googleapis.com`.
5. Skip the Advanced section and click "Save".
6. Next we need to enable automatic video optimizations in the [Video Settings](https://imagekit.io/dashboard/settings/videos). Click on the **Video Optimization** section.
7. Enable the **Use best format for video delivery** option.
8. Enable the **Optimize video quality before delivery** option, choose `40%` for the quality
9. You can leave the other options as default and click "Save" at the top right corner.
10.   Now your ImageKit account is ready to use 🚀

# Stripe Setup

We use [Stripe](https://docs.stripe.com/cli) for processing payments and easily integrate Stripe forms into our application.

**For access you will need to request your team for additional support**

### Configure Local Development

1. Navigate to [Stripe dashboard in Dev Mode](https://dashboard.stripe.com/test/dashboard) and sign up for a new account. Request access if needed.
2. On [API Keys](https://dashboard.stripe.com/test/apikeys) copy the publishable and secret keys
   1. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={copied_value}
   2. STRIPE_SECRET_KEY={copied_value}
3. WebHooks Local Testing - Via the CLI its possible to forward webhooks to the local development environment, more [here](https://dashboard.stripe.com/test/webhooks/create?endpoint_location=local)
   1. Listen to Stripe Webhook events - `stripe listen --forward-to http://127.0.0.1:5001/careerfairy-e1fd9/europe-west1/stripeWebHook`
4. Setup Price IDs - While testing the following environment variables regarding Stripe prices need to be set
   The API IDs can be found on Stripe for each product, as [Sparks Advanced CH](https://dashboard.stripe.com/test/products/prod_PlbjRlHrGoiWwW)
   1. Swiss Prices
      1. NEXT_PUBLIC_SPARKS_ESSENTIAL_STRIPE_PRICE_ID_CH
      2. NEXT_PUBLIC_SPARKS_ADVANCED_STRIPE_PRICE_ID_CH
      3. NEXT_PUBLIC_SPARKS_PREMIUM_STRIPE_PRICE_ID_CH
   2. Non Swiss Prices
      1. NEXT_PUBLIC_SPARKS_ESSENTIAL_STRIPE_PRICE_ID
      2. NEXT_PUBLIC_SPARKS_ADVANCED_STRIPE_PRICE_ID
      3. NEXT_PUBLIC_SPARKS_PREMIUM_STRIPE_PRICE_ID
   3. Stripe specific test cards can be found [here](https://docs.stripe.com/testing#use-test-cards)

# Setting Up Algolia

## Algolia Setup for Web App

1. **Environment Variables:** Ensure you have the Algolia environment variables set up in your `.env.local` file for the web app. You need to specify the Algolia App ID and the Algolia Search API Key, they can be obtained by logging into the [shared](https://www.notion.so/Algolia-Search-b05602e4ff25447d8e1c0e865f627cb1) Algolia account. Refer to the example in `apps/web/.env.local.example`:

```sell
NEXT_PUBLIC_ALGOLIA_APP_ID=ask-your-team
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=ask-your-team
NEXT_PUBLIC_DEV_NAME=dev_firstName
```

## Full Index Sync with Algolia

To synchronize a Firestore collection with Algolia, you can trigger a full index sync. This process is defined in `packages/functions/src/search.ts`.

1. **Triggering the Sync:** Use the curl command to start the sync. Replace `indexName` with one of the available index names at `packages/functions/src/lib/search/searchIndexes.ts` and `secretKey` with the `ALGOLIA_FULL_SYNC_SECRET_KEY` found in `packages/functions/.env`.

Development:

```shell
curl "http://127.0.0.1:5001/careerfairy-e1fd9/europe-west1/fullIndexSync?indexName=livestreams&secretKey=yourSecretKey"
```

Production:

```shell
curl "https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/fullIndexSync?indexName=livestreams&secretKey=yourSecretKey"
```

2. **Monitoring the Sync:** The function logs the progress of the sync operation. Check the Firebase Functions logs at http://localhost:4000/logs (dev) or https://console.cloud.google.com/functions/list?project=careerfairy-e1fd9 for information about the number of documents synced.

By following these steps, you'll have Algolia set up for the web app and know how to perform a full index sync to keep your search indices up to date.

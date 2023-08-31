# CareerFairy Apps

Monorepo with all the apps, managed by npm workspaces and turborepo.

### Requirements

-  `node` v14 (webapp), v16 (functions)
-  `npm` (>v7)

## Setup root folder

Since we're using npm workspaces, only run `npm` commands on the root folder. There will be a shared `node_modules`
folder at the root folder for all the apps/packages.

```sh
# install deps for all workspaces (app/*, packages/*)
npm install

# runs only once after cloning, will setup husky hooks
npm run prepare
```

## NPM Commands

```sh
# Builds all the workspaces
npm run build

# Fetches a remote production backup and stores on emulatorData/fetched
npm run start -w @careerfairy/fetch-firestore-data

# Dev environment with hot reload
# web app + local emulators with data imported from emulatorData/fetched
# Since this runs the firebase emulators, you need 10GB of memory available, check (/packages/fetch-firestore-data/README.md)
npm run dev

# Installing a dependency, you need to specify the workspace
npm install --workspace @careerfairy/webapp lodash
```

## Existing Git Hooks

-  Pre-commit: will run prettier formater
-  Pre-push: will run unit tests

# Web App (NextJS)

## Development

```sh
npm run dev -w @careerfairy/webapp
```

## Testing

There are two types of tests that you can run

-  Unit Tests with Jest:

```sh
npm run test
# To run all normal unit test files located in apps/packages that have them
```

-  End-To-End Tests with Playwright:

```sh
npm run test:e2e-webapp
# Run the end-to-end tests for the web app
# using the functions, firestore and auth emulators
```

The upon test completion or failure a report html folder is generated which can be accessed
in `./apps/web/playwright-report`. If the test had failed, the report will include screenshots and video recordings of
what produced the failure as seen below:
![failed report example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-example.png?alt=media&token=bb91ecc7-d4f1-457e-a1fc-c5b811dad706)

There are two ways in which you can open up the report:

-  running the root script `npm run webapp:report`
-  Running the index.html file within `./apps/web/playwright-report`

## Storybook

Run Storybook UI:

```shell
npm run storybook
```

## CI

The CI Pipeline now runs on every push/pull_request test results are always uploaded through a GitHub action and are
stored in a zip file attached to the pipeline as seen below:
![uploaded report folder example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-upload-example.png?alt=media&token=51f95e0d-26aa-4e49-b724-515c6991a74a)

# Firebase Functions

## Build

```sh
npm run build -w @careerfairy/functions
# or npm run build
```

## Deploy a function

```sh
cd packages/functions
npx firelink deploy --only functions:slackHandleInteractions
```

## Start the firebase emulators with data

Run the script `packages/fetch-firestore-data` (check its readme for more info):

```sh
# Fetches a remote production backup and stores on emulatorData/fetched
npm run start -w @careerfairy/fetch-firestore-data
```

### Emulator UI

When running `npm run dev` or `npm run dev -w @careerfairy-functions` the emulators will be started.

http://localhost:4000/

## Firestore Rules

Update the `firestore.rules` file with your new rules, test them using the local emulators.

Create a Pull Request with the new changes, and only after approval, you should deploy them using `npm run deploy:rules`
.

### Run E2E tests on a linux docker container

Useful to find test flaws that appear during CI.
Adjust the docker resources to match the CI runners specs (2cpu, 7GB memory).

```sh
# Build the image first, it will install all deps (linux use different binaries - swc, turbo, etc)
docker build -t tests -f apps/web/Dockerfile.test .

# Run the tests inside the built docker image
# You can modify the app files without building the image again
docker run  -p 9323:9323 \
            -p 8080:8080 \
            -v $(pwd)/apps/web/:/app/apps/web \
            -it --entrypoint "" \
            -e DEBUG=pw:webserver tests \
            npm run test:e2e-webapp -- -- --project=firefox -g "Create a draft livestream from the main page"
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
npm run script -w @careerfairy/firebase-scripts -- scriptPath=<path-to-script>
```

In order to run the script on production you need to add a flag `useProd=true` to the command.

```sh
npm run script -w @careerfairy/firebase-scripts -- useProd=true scriptPath=<path-to-script>
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

### Configure Environment Variables

1. Upon completing the account setup, you'll be provided with an `imagekitId`. You can find this ID on the [Developer API Keys Dashboard](https://imagekit.io/dashboard/developer/api-keys) of your ImageKit account. Copy this ID for the next step.
2. If you don't already have a `.env.local` file in your [project](./apps/web/.env.local), make a copy of the `.env.local.example` file located [here](./apps/web/.env.local.example) and rename it to `.env.local`.
3. Open your `.env.local` file and paste your `imagekitId` in the designated area, like so:

       ```env
       NEXT_PUBLIC_IMAGEKIT_ID=YOUR_IMAGEKIT_ID
       ```

   For testing and production environments, the `NEXT_PUBLIC_IMAGEKIT_ID` will be configured in the CI/CD pipeline and the [.env.test](./apps/web/.env.test) file, respectively.

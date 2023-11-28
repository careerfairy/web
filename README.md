# CareerFairy Apps

Monorepo with all the apps, managed by npm workspaces and turborepo.

### Requirements

-  `node` (v18)
-  `npm` (>v9)

Check our [Development Environment Setup Guide](https://www.notion.so/Development-Environment-Setup-Guide-a5f414de756245aabde5a7d4e9a48350) article for instructions on how to setup your machine.

## Setup root folder

Since we're using npm workspaces, only run `npm` commands on the root folder. There will be a shared `node_modules`
folder at the root folder for all the apps/packages.

```sh
# install deps for all workspaces (app/*, packages/*)
npm install

# runs only once after cloning, will setup husky hooks
npm run prepare
```

Make a copies in place for the `env.local.example` file for the [web app](./apps/web/.env.local.example) and the [functions package](./packages/functions/.env.local.example) and rename them to `env.local`. Ask your colleagues for the values of the environment values.
For ImageKit check [this section](#configure-environment-variables).

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

Upon test completion or failure a report html folder is generated which can be accessed
in `./apps/web/playwright-report`.

If the test had failed, the report will include screenshots and video recordings of
what produced the failure as seen below:
![failed report example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-example.png?alt=media&token=bb91ecc7-d4f1-457e-a1fc-c5b811dad706)

There are two ways in which you can open up the report:

-  Running the root script `npm run webapp:report`
-  Running the index.html file within `./apps/web/playwright-report`

## Storybook

Run Storybook UI:

```shell
npm run storybook
```

## CI

The CI Pipeline now runs on every push/pull request and test results are always uploaded through a GitHub action and are
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

Create a Pull Request with the new changes, and only after approval, should you deploy them using `npm run deploy:rules`.

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
6. Next we need to enable automatic video optimizations in the [Video Settings](https://imagekit.io/dashboard/settings/videos). Click on the **Video Optimization** section.
7. Enable the **Use best format for video delivery** option.
8. Enable the **Optimize video quality before delivery** option, choose `40%` for the quality
9. You can leave the other options as default and click "Save" at the top right corner.
10.   Now your ImageKit account is ready to use 🚀

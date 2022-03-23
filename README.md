# CareerFairy Apps

Monorepo with all the apps, managed by npm workspaces and turborepo.

### Requirements

-  `node` v14 (webapp), v16 (functions)
-  `npm` (>v7)

## Setup root folder

Since we're using npm workspaces, only run `npm` commands on the root folder. There will be a shared `node_modules` folder at the root folder for all the apps/packages.

```sh
# install deps for all workspaces (app/*, packages/*)
npm install

# runs only once after cloning, will setup husky hooks
npm prepare
```

## NPM Commands

```sh
# Builds all the workspaces
npm run build

# Dev environment (web app + local emulators without data) with hot reload
npm run dev

# Installing a dependency, you need to specify the workspace
npm install --workspace careerfairy-webapp lodash
```

## Existing Git Hooks

-  Pre-commit: will run prettier formater
-  Pre-push: will run unit tests

# Web App (NextJS)

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
in `./apps/web/playwright-report`. If the test had failed, the report will include screenshots
and video recordings of what produced the failure as seen below:
![failed report example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-example.png?alt=media&token=bb91ecc7-d4f1-457e-a1fc-c5b811dad706)

There are two ways in which you can open up the report:

-  running the root script `npm run webapp:report`
-  Running the index.html file within `./apps/web/playwright-report`

## CI

The CI Pipeline now runs on every push/pull_request
test results are always uploaded through a GitHub action and are stored
in a zip file attached to the pipeline as seen below:
![uploaded report folder example](https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Freport-upload-example.png?alt=media&token=51f95e0d-26aa-4e49-b724-515c6991a74a)

## Development

```sh
npm run dev -w careerfairy-webapp
```

# Firebase Functions

## Build

```sh
npm run build -w careerfairy-functions
# or npm run build
```

## Deploy a function

```sh
cd packages/functions
npx firelink deploy --only functions:slackHandleInteractions
```

## Start the firebase emulators with data

Check below how to fetch a remote backup to use it as import data to the emulators.

-  Manually without scripts:

```sh
env FIREBASE_AUTH_EMULATOR_HOST="localhost:9099" \
    FIRESTORE_EMULATOR_HOST="localhost:8080" \
    JAVA_TOOL_OPTIONS="-Xmx10g" \
    npx firebase emulators:start --only firestore,auth,functions --export-on-exit \
    --import "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)"
```

-  With backup data:
   -  `./scripts/run-locally-with-emulators.sh "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)"`
   -  Heads up! Importing data into the emulator could take a while, you also need at least ~10GB of free memory for the emulator heap.
   -  To save your firestore data changes, run the script with the arg `--export-on-exit`:
      -  `./scripts/run-locally-with-emulators.sh "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)" --export-on-exit`
-  Empty data:
   -  `./scripts/run-locally-with-emulators.sh` or `npm run start:emulators`

### Emulator UI

http://localhost:4000/

### Fetch a remote backup

-  `gcloud init`: google authentication, select the careerfairy project
-  `gsutil ls "gs://careerfairy-backup/Thu Mar 03 2022*"`: Find the most recent backup folder
   -  Modify the date to your current time
   -  Or check the most recent job on the [Google Cloud Dashboard](https://console.cloud.google.com/firestore/import-export?authuser=1&project=careerfairy-e1fd9)
-  `gsutil -m cp -r "gs://careerfairy-backup/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)/" emulatorData/`: Will download the backup folder into the local folder `emulatorData/` (you need to create this folder)

### Requirements

-  `gcloud` [Install instructions](https://cloud.google.com/storage/docs/gsutil_install)

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

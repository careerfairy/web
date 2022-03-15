# CareerFairy Apps

## Setup root folder

You need to install the root folder deps for the git pre-commit hook to work.
Everytime there is a commit, the hook will run prettier to format the changed files.

```sh
# Will also install deps on app/ and functions/
npm install
```

# Web App (NextJS)

## Development

```sh
cd app
npm run dev
```

## Local Setup

### Requirements

-  `node` (v14, v16)
-  `gcloud` [Install instructions](https://cloud.google.com/storage/docs/gsutil_install)

### Fetch a remote backup

-  `gcloud init`: google authentication, select the careerfairy project
-  `gsutil ls "gs://careerfairy-backup/Thu Mar 03 2022*"`: Find the most recent backup folder
   -  Modify the date to your current time
   -  Or check the most recent job on the [Google Cloud Dashboard](https://console.cloud.google.com/firestore/import-export?authuser=1&project=careerfairy-e1fd9)
-  `gsutil -m cp -r "gs://careerfairy-backup/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)/" emulatorData/`: Will download the backup folder into the local folder `emulatorData/` (you need to create this folder)

### Start the emulators

-  With backup data:
   -  `./scripts/run-locally-with-emulators.sh "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)"`
   -  Heads up! Importing data into the emulator could take a while, you also need at least ~10GB of free memory for the emulator heap.
   -  To save your firestore data changes, run the script with the arg `--export-on-exit`:
      -  `./scripts/run-locally-with-emulators.sh "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)" --export-on-exit`
-  Empty data:

   -  `./scripts/run-locally-with-emulators.sh` or `npm run start:emulators`

-  Manually without scripts:

```sh
env FIREBASE_AUTH_EMULATOR_HOST="localhost:9099" \
    FIRESTORE_EMULATOR_HOST="localhost:8080" \
    JAVA_TOOL_OPTIONS="-Xmx10g" \
    npx firebase emulators:start --only firestore,auth,functions --export-on-exit \
    --import "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)"
```

### Emulator UI

http://localhost:4000/

# Firebase Functions

## Build

```sh
cd functions
npm run build
```

## Deploy a function

```sh
# From the root folder
# It will build before deploying
npx firebase deploy --only functions:slackHandleInteractions
```

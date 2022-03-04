# CareerFairy Apps

# Web App

## Local Setup

### Requirements

-  `node` (v14, v16)
-  `gcloud` [Install instructions](https://cloud.google.com/storage/docs/gsutil_install)

### Fetch a remote backup

-  `gcloud init`: google authentication, select the careerfairy project
-  `gsutil ls "gs://careerfairy-backup/Thu Mar 03 2022*"`: Find the most recent backup folder
   -  Modify the date to your current time
   -  Or check the most recent job on the [Google Cloud Dashboard](https://console.cloud.google.com/firestore/import-export?authuser=1&project=careerfairy-e1fd9)
-  `gsutil -m cp -r "gs://careerfairy-backup/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)/" emulatorData/`: Will download the backup folder into the local folder `emulatorData/`

### Start the emulators

-  With backup data:
   -  `./scripts/run-locally-with-emulators.sh "./emulatorData/Thu Mar 03 2022-18:31:04 GMT+0000 (Coordinated Universal Time)"`
   -  Heads up! Importing data into the emulator could take a while, you also need at least ~7GB of free memory for the emulator heap.
-  Empty data:
   -  `./scripts/run-locally-with-emulators.sh` or `npm run start:emulators`

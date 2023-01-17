# Fetch Production Data

Script to download a production backup from Google Storage Buckets (we have backups every hour). After download, it
starts the emulators, deletes unnecessary collections and creates some users for testing.

This script is intended to be run:

-  On the first repo clone, to setup your local environment
-  Occasionally, when you need more recent data to develop, update the `config.ts` file to use a more recent backup

After running the script you should have the folder `emulatorData/fetched` ready to be imported from the emulators.

## Requirements

These binaries should be on your shell PATH:

-  `java` (for the emulators)
-  `gsutil` (with login, careerfairy project selected)
   -  [Install instructions](https://cloud.google.com/storage/docs/gsutil_install)

### Java Heap Memory Increase (10GB)

The firebase emulators are a java app, since they will need to import the data into memory, we need to increase the available heap for the JVM to work fine.
If the JVM doesn't have enough heap size, it will crash or be very slow because it needs to do a lot of GC's to free memory.

On the `package.json` `start:emulators` task, we set the environment variable `JAVA_TOOL_OPTIONS=-Xmx10g` to increase the JVM Heap size to 10GB, make sure your system has enough memory.

## Run

```sh
npm run build:fetch-firestore-data
npm run start -w @careerfairy/fetch-firestore-data
```

## Update data

Update the `config.ts` file, `BUCKET_FOLDER` with a more recent backup folder.

You can get the latest backups times in these ways:

-  Check the most recent job on the [Google Cloud Dashboard](https://console.cloud.google.com/firestore/import-export?authuser=1&project=careerfairy-e1fd9)
-  `gsutil ls "gs://careerfairy-backup/Thu Mar 03 2022*"`: Find the most recent backup folder
   -  Modify the date to your current time

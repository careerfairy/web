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

## Run

You can run these commands from anywhere in the monorepo:

```sh
# Step 1: Export production data to create the "fetched" backup
# Do this every now and then to have an updated data set. Only one team member needs to run this.
# The export will be saved to gs://careerfairy-backup/fetched
# This task generates lots of document reads and takes ~5 minutes
pnpm run fetch-data:export

# Step 2: Download the "fetched" backup, start emulators, and import the data
# This downloads from gs://careerfairy-backup/fetched to emulatorData/fetched
pnpm run fetch-data
```

Alternatively, if you're in the `packages/fetch-firestore-data` directory, you can run:

```sh
pnpm run production:export  # Step 1
pnpm run start              # Step 2
```

By default, the existing users data will not be exported / imported. If you want to include it (e.g to have correct analytics), you need to set an environment variable:

```sh
# bash & zsh shells (set's the environment for the current shell lifetime only)
export INCLUDE_USERDATA=true
# fish shell: set -x INCLUDE_USERDATA true

# Run the script commands that read the environment variables
pnpm run fetch-data:export
pnpm run fetch-data
```

### Java Heap Memory Increase (15GB)

The firebase emulators are a java app, since they will need to import the data into memory, we need to increase the available heap for the JVM to work fine.
If the JVM doesn't have enough heap size, it will crash or be very slow because it needs to do a lot of GC's to free memory.

On the `package.json` `start:emulators` task, we set the environment variable `JAVA_TOOL_OPTIONS=-Xmx15g` to increase the JVM Heap size to 15GB, make sure your system has enough memory.

## All backup exports

You can get the latest backups times in these ways:

-  [Google Cloud Dashboard](https://console.cloud.google.com/firestore/import-export?authuser=1&project=careerfairy-e1fd9)
-  `gsutil ls "gs://careerfairy-backup/Thu Mar 03 2022*"`: Find the most recent backup folder
   -  Modify the date to your current time

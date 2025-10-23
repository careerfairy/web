# Deny Old Recordings

Backfills the `denyRecordingAccess` flag to `true` of all the live streams that took place before 27.01.2023.

## Run

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/denyOldRecordings
```

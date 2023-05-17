# Backfill livestream deny recording flag

Backfills the `denyRecordingAccess` flag to `false` of all the live streams that do not have that field.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamDenyRecordingFlag
```

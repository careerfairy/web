# Backfill Target Field Of Study

After the release of the new live stream creation flow (with feature flag `livestreamCreationFlowV2`), we now consider that the "Any field of study" option should save all of the fields of study in the live stream document instead of an empty array.

This backfill script will replace all empty target field of study values of live stream documents with all fields of study.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backfillTargetFieldOfStudy
```

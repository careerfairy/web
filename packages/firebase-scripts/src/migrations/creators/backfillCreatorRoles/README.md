# Backfill Creators Role For Livestreams

After the release of the new live stream creation flow (with feature flag `livestreamCreationFlowV2`) there was a bug where the creator's role was not being set properly when in the live stream creation form. This migration fixes that, it appends the Speaker role to the creator's roles for every creator that is associated to a live stream.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/creators/backfillCreatorRoles
```

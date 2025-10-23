# Backfill Creator Company Fields From Group

This script backfills `companyName` and `companyLogoUrl` based on the creator's `groupId` across:

1. `careerCenterData/{groupId}/creators/{creatorId}` documents (adds missing `companyName`/`companyLogoUrl` from the group's `universityName`/`logoUrl`)
2. `livestreams` and `draftLivestreams` speaker arrays (`speakers` and `adHocSpeakers`) when these fields are missing
3. `sparks/{sparkId}` embedded `creator` object when these fields are missing

It follows the established migration patterns (progress bars, counters, and batched writes).

## Run

To run this script, use the following command:

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=./migrations/creators/backfillCompanyFieldsFromGroup
```

## Notes

-  Only missing fields are backfilled; existing non-empty values are preserved
-  Writes are batched using the shared BatchManager to respect Firestore limits

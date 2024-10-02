# Back-fill Custom Job Applications Removed from User profile flag

Checks every document in collection `/jobApplications` and if there is no flag for field removedFromUserProfile (meaning undefined), set a default with value `false`.

## Why ?

This backfill is needed in order to remove in memory filtering currently being done by custom hook `apps/web/components/custom-hook/custom-job/useUserJobApplications.tsx`, as due to firestore limitations the query cannot be performed fully as some items in `jobApplications` will not have this flag.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/jobs/backFillJobApplicationsRemovedFromUserProfile
```

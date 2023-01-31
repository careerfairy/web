# Backfill Users Last Activity

Will fetch all the users in Firebase Auth and update the userData documents with the correct `lastActivityAt` and `createdAt`.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillLastActivity
```

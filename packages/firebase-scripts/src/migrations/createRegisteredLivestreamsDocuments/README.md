# Create Registered Live Streams Documents

This script triggers the backfill process for the `registeredLivestreams` collection by updating all `userLivestreamData` documents with a migration trigger field. This action will invoke the `onUserRegistration` cloud function to create and update the `registeredLivestreams` documents.

## What it does

1. Queries all `userLivestreamData` documents using a collection group query.
2. Processes these documents in batches of 5,000.
3. Updates each document with a `migrationTrigger` field set to the current timestamp.
4. This update triggers the `onUserRegistration` cloud function, which creates or updates the corresponding `registeredLivestreams` document.

## How to run

Execute the following command:

```shell
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/createRegisteredLivestreamsDocuments
```

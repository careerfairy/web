### Backfill Livestreams Collection:

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/makeAllUserLivestreamDataRegisteredForEvent
```

#### What it does:

Get every userLivestreamData document for a specific event and makes all the documents that are not registered for the event, registered for the event.

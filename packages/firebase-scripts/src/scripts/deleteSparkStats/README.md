### Delete Spark Stats:

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=./scripts/deleteSparkStats
```

#### What it does:

It goes through the Spark Stats collection, Liked Sparks and Seen Sparks subCollections and deletes all the documents.
`sparkStats`
`userData/likedSparks`
`userData/seenSparks`

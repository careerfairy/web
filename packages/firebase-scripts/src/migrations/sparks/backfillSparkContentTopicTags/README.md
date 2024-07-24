# Back-fill Live stream tags

Will fetch all parks, and for each spark will map its category to the content topics tag ids.
For this purpose 1 new field is introduced on the `sparks` collection:

```TYPESCRIPT
contentTopicsTagIds?: string[]
```

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/sparks/backfillSparkContentTopicTags
```

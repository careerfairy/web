# Back-fill Live stream tags

Will fetch all live streams, and based on the stream interests or hosting company industries will populate the new tag category fields
accordingly.
For this purpose 2 new fields are introduced on the `livestreams` collection ():

```TYPESCRIPT
businessFunctionsTagIds?: string[]
contentTopicsTagIds?: string[]
```

## Run

```sh
pnpm run script --filter @careerfairy/firebase-scripts scriptPath=./migrations/livestreams/backfillLivestreamTags
```

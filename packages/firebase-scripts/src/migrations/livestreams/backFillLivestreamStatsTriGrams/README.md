# Back-fill Livestream Stats with Search trigrams

Will fetch all live streams stats, generate the trigrams from the livestream public data and save this new field.

No other fields will be updated.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamStatsTriGrams
```

# Back-fill Live Stream Stats

Will fetch all the userLivestreamData and aggregate their stats in memory. Once aggregated in memory, it will SET the stats for each livestream in batches of 200.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamStats
```

# Backfill Livestream Feedbacks Ratings into Livestream Stats

Will fetch all the livestream ratings, aggregate them and update the corresponding livestream stats documents.

## Run

```sh
pnpm run script --filter @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backfillFeedbacksToStats
```

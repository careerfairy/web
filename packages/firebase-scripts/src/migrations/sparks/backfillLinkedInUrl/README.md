# Backfill Spark Stats

This script backfills the `linkedInUrl` field from `spark` documents based on its counterpart in `careerCenterData\creators` sub-collection.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/sparks/backfillLinkedInUrl
```

## What it does

1. Fetches all `sparks` from `/sparks`.
2. Fetches all `creators` from `/careerCenterData/creators`.
3. Filters all spark documents without `creator.linkedInUrl`.
4. Then update each `sparks` with the `linkedInUrl` field from the `creator` data

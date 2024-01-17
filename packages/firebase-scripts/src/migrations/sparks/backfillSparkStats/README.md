# Backfill Spark Stats

This script backfills the `industries`, `location`, `size` fields from the linked `/careerCenterData` and the `category` field from the `spark` to each `/sparksStats` document

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/sparks/backfillSparkStats
```

## What it does

1. Fetches all `SparkStats` from `/sparkStats`.
2. For each `SparkStat`, gets the `group` data to extract the `industries`, `location` and `size` fields.
3. Then update each `SparkStats` with the company extracted field plus the `category` field from the `Spark` data

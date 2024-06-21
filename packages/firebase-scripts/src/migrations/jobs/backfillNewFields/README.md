# Backfill new Custom Jobs fields

This script backfills the new fields `sparks`, `published` and turns `deadline` field mandatory on the existing documents from the collections `CustomJobs`, `CustomJobStats` and `JobApplications`.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/jobs/backfillNewFields
```

## What it does

1. Fetches all `CustomJobs`.
2. For each `CustomJob`, update the mentioned fields.
3. The update on the related `CustomJobStats` and `JobApplication` should be managed by the onWrite triggers.

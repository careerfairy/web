# Migrate Custom Jobs

This script migrates `CustomJobs` from `/careerCenterData/[groupId]/customJobs/[jobId]` to `/customJobs`. It also deprecates the `applicants` and `clicks` fields in the `CustomJob` documents. For each applicant in the deprecated `applicants` field, it fetches their `UserData` and creates a `CustomJobApplicant` document in `/customJobStat/[jobId]/applicants/[userId]`.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/jobs/migrateCustomJobs
```

## What it does

1. Fetches all `CustomJobs` from `/careerCenterData/[groupId]/customJobs/[jobId]`.
2. For each `CustomJob`, creates a new document in `/customJobs` with the same data, excluding the `applicants` and `clicks` fields.
3. For each applicant in the deprecated `applicants` field, fetches their [UserData](file:///Users/habibkadiri/repos/web/packages/firebase-scripts/src/migrations/users/backfillUsers/index.ts#6%2C4-6%2C4) and creates a `CustomJobApplicant` document in `/customJobStat/[jobId]/applicants/[userId]`.

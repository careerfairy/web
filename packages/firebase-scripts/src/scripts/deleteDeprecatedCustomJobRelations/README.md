# Delete deprecated Custom Job relations

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/deleteDeprecatedCustomJobRelations
```

## What it does

This script removes all the deprecated fields or sub collections related to the `CustomJobs` and `CustomJobApplications` from `/careerCenterData/[groupId]/customJobs/[jobId]`, `/userData/[userEmail]/customJobApplications`, `/livestreams/[livestreamId]` and `/draftLivestreams/[draftLivestreamId]`.

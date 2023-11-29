# Set Sparks Plan For Flagged Groups

This script sets a sparks plan for all groups with `group.sparksAdminPageFlag` set to true and that do not already have a plan. This script is idempotent, so it can be run multiple times without affecting current group plans.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/setSparksPlanForFlaggedGroups
```

This script fetches all groups, filters those with `sparksAdminPageFlag` set to true that don't already have a plan, and sets a sparks plan for each of these groups using the `bulkWriter` for efficient batch writing. The `handleBulkWriterSuccess` and `handleBulkWriterError` functions are used to handle the success and error cases respectively.

# Backfill Highest Proficiency Language Code

Backfills the `highestProficiencyLanguageCode` field on all `userData` documents by computing it from the user's languages subcollection.

## What it does

1. Fetches all users from the `userData` collection using cursor-based pagination
2. For each user, fetches their languages from the `userData/{userId}/languages` subcollection
3. Computes the highest proficiency language using `getHighestProficiencyLanguageCode` utility
   -  Sorts languages by proficiency (descending), then by languageId (ascending)
   -  Returns the language ID of the highest proficiency language
4. Updates the `userData` document with the computed `highestProficiencyLanguageCode` field

## Configuration

Edit the constants in `index.ts` before running:

-  `BATCH_SIZE = 200` - Number of users to process per batch
-  `DRY_RUN = false` - Set to `true` to test without making changes

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillHighestProficiencyLanguage
```

## Example Output

The script updates each `userData` document:

```javascript
{
   // ... existing userData fields ...
   highestProficiencyLanguageCode: "en" // or "es", "fr", etc.
}
```

## Notes

-  Uses cursor-based pagination to avoid loading all users into memory
-  Uses `bulkWriter` for individual update operations (not atomic batches)
-  Gracefully handles deleted users without failing the entire migration
-  Processes users in batches of 200 for efficiency
-  Flushes writes after each paginated batch
-  Includes progress tracking via the progress bar

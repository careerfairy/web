# Migrate Creator IDs

This script is designed to migrate the IDs of creators in the Firestore database. Here's a step-by-step breakdown of what the script does:

1. Fetches all creators and sparks from the Firestore database.
2. For each creator:
   -  Generates a new Firestore ID.
   -  Updates the creator's ID with the new one.
   -  Creates a new document in the Firestore database with the new ID and the creator's data.
   -  Deletes the old document that used the creator's email as the ID.
   -  Updates the embedded creator data in all sparks that reference this creator with the new ID and the public data of the creator.
3. Commits all the changes made in the Firestore database as a batch operation.

## Run

To run this script, use the following command:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/creators/migrateCreatorIds
```

Please note that this script should be used with caution as it modifies the Firestore database directly. Always make sure to have a backup of your data before running this script.

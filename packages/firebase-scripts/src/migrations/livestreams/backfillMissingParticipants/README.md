### Backfill Missing Participants for a Specific Live Stream

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backfillMissingParticipants
```

#### What it does:

This script targets a specific live stream (defined by `TARGET_LIVESTREAM_ID`) and updates its `participatingStudents` field based on the data in the `participatingStats` subcollection. It performs the following steps:

1. Retrieves all documents from the `participatingStats` subcollection of the target live stream.
2. Extracts the email addresses (document IDs) of participating students.
3. Updates the main live stream document by adding these email addresses to the `participatingStudents` array field.

#### Example Output:

The script will update the `livestreams/{TARGET_LIVESTREAM_ID}` document:

```javascript
{
  // ... existing fields ...
  "participatingStudents": [
    "student1@example.com",
    "student2@example.com",
    // ... more participating student emails ...
  ]
}
```

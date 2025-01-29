# Update Documents Migration Script

This script provides a configurable way to update multiple Firestore documents in batches. It's designed to handle large-scale document updates efficiently with built-in progress tracking and error handling.

## Features

-  Batch processing with configurable batch sizes
-  Progress tracking with percentage completion
-  Configurable wait time between batches to manage load
-  Error handling and success tracking
-  Support for collection and collection group queries

## Configuration

The script can be configured by modifying the `config` object in `index.ts`:

```typescript
{
   query: firestore.collection("userData"), // The query to select documents
   updateData: { migrationTrigger: Date.now() }, // The data to update
   batchSize: 1_000, // Number of documents per batch
   waitTimeBetweenBatches: 5000 // Wait time in ms between batches
}
```

## Run

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/updateDocuments
```

## What it does

1. Counts total documents matching the query
2. Processes documents in configurable batches
3. Updates each document with the specified data
4. Tracks progress and reports completion percentage
5. Handles errors and provides success/failure counts

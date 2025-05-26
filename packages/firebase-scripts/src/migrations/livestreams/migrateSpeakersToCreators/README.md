# Migrate Speakers to Creators Migration

## Purpose

This migration deprecates the `email` field from `livestream.speakers[]` to prevent exposing sensitive email data on the client side. It backfills speaker data by associating them with existing creators or creating new creators.

## What it does

1. **Fetches all livestreams and creators** from both regular and draft collections
2. **For each speaker in each livestream:**
   -  Checks if the speaker already has a creator ID (skips if already processed)
   -  Looks for an existing creator with matching email in any of the livestream's associated groups
   -  If found: Links the speaker to the existing creator by setting `speaker.id` and adding to `livestream.creatorsIds`
   -  If not found: Creates a new creator document with the speaker's data
3. **Removes the email field** from speakers after successful linking
4. **Updates livestream documents** with the new speaker and creator associations

## Key Features

-  **Safe processing**: Only processes speakers that have emails but no creator ID
-  **Group validation**: Ensures creators are only matched within the correct groups
-  **Error handling**: Continues processing even if individual creator creation fails
-  **Batch processing**: Processes livestreams in manageable batches
-  **Progress tracking**: Shows progress and provides detailed counters

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/migrateSpeakersToCreators
```

## Dry Run Mode

When `DRY_RUN` is set to `true` in the `index.ts` file:

-  No creators are created
-  No livestream documents are updated
-  All inconsistencies are detected and logged at the end
-  Provides counts of what _would_ be changed

## Results Tracking

The migration tracks:

**Normal Mode (DRY_RUN = false):**

-  `speakersLinkedToExistingCreators`: Number of speakers successfully linked to existing creators
-  `newCreatorsCreated`: Number of new creator documents created
-  `livestreamsUpdated`: Number of livestream documents that were updated
-  `speakersWithMismatchedIds`: Number of speakers that had matching emails to creators but different IDs (data inconsistency detection)

**Dry Run Mode (DRY_RUN = true):**

-  `speakersLinkedToExistingCreators`: Number of speakers that _would be_ linked to existing creators (if email matches and ID is different or missing)
-  `newCreatorsWouldBeCreated`: Number of new creator documents that _would be_ created
-  `livestreamsWouldBeUpdated`: Number of livestream documents that _would be_ updated
-  `speakersWithMismatchedIds`: Number of speakers with email/ID mismatches (same as normal mode, inconsistencies are just logged)

## Safety Notes

-  Speakers without emails are left unchanged.
-  Original speaker data is preserved if creator creation fails (in normal mode).
-  The migration processes both regular livestreams and draft livestreams.
-  Uses smaller batch sizes (50) due to potential creator document creation.

## After Migration

Once this migration is complete:

-  All livestream speakers should have creator IDs instead of emails.
-  Email-based matching (like in `getCreatorsWithPublicContent`) can be replaced with ID-based lookups.
-  Client-side code will no longer have access to speaker email addresses.
-  The `Speaker.email` field can be fully removed from the interface (it is already typed as `never` which should be causing type errors if used).

## Version

1.0

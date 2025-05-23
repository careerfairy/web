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

## Results Tracking

The migration tracks:

-  `speakersLinkedToExistingCreators`: Number of speakers successfully linked to existing creators
-  `newCreatorsCreated`: Number of new creator documents created
-  `livestreamsUpdated`: Number of livestream documents that were updated

## Safety Notes

-  Speakers without emails or with existing creator IDs are left unchanged
-  Original speaker data is preserved if creator creation fails
-  The migration processes both regular livestreams and draft livestreams
-  Uses smaller batch sizes (50) due to potential creator document creation

## After Migration

Once this migration is complete:

-  All livestream speakers should have creator IDs instead of emails
-  Email-based matching (like in `getCreatorsWithPublicContent`) can be replaced with ID-based lookups
-  Client-side code will no longer have access to speaker email addresses
-  The `Speaker.email` field can be fully removed from the interface

## Version

1.0

# Migrate Speakers to Creators Migration

## Purpose

Deprecates `email` field from `livestream.speakers[]` and backfills speaker data by linking to existing creators or creating new ones using multiple matching strategies.

## What it does

1. **Fetches** all livestreams, creators, and groups
2. **For each speaker:**
   -  Skips if already correctly linked
   -  Matches using: email, name (case-insensitive), or backfilled email
   -  Links to existing creator OR creates new creator
   -  Generates backfilled emails for speakers without emails: `backfill+firstname_lastname_groupId@careerfairy.io`
3. **Updates** livestream documents with new speaker/creator associations

## Key Features

-  **Multiple matching strategies** (email, name, backfilled email)
-  **Backfilled email generation** for speakers without emails
-  **Smart group selection** (prioritizes company over university groups)
-  **Batch processing** with progress tracking and error handling

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/migrateSpeakersToCreators
```

## Configuration

Set `DRY_RUN = true` in `index.ts` to simulate without making changes.

## Tracking Counters

**Normal Mode:**

-  `speakersMatchedByEmail/Name/BackfilledEmail` - Matching statistics
-  `speakersAlreadyLinkedCorrectly` - Already processed speakers
-  `newCreatorsCreated` - New creator documents
-  `speakersWithBackfilledEmails` - Generated emails
-  `livestreamsUpdated` - Updated documents

**Dry Run:** Same counters with `WouldBe` suffixes

## Group Selection

When multiple groups exist:

1. Prioritizes company groups (no `universityCode`)
2. Falls back to first valid group
3. Uses first group ID if data unavailable

## Safety Notes

-  Preserves original data on creator creation failure
-  Processes both regular and draft livestreams
-  Uses batch size of 300 for efficient processing
-  Updates (not removes) email fields for consistency

## After Migration

-  All speakers have creator IDs and emails (original or backfilled)
-  Email-based matching can be replaced with ID-based lookups
-  Client-side access to original emails is removed
-  `Speaker.email` field can be fully deprecated

## Version

1.0

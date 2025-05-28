# Remove Personal Email Data from Livestreams

This migration removes personal email addresses from all livestream events for data privacy compliance.

## What it does

1. Fetches all regular livestreams and draft livestreams
2. For each livestream:
   -  Removes email addresses from all speakers
   -  Removes email addresses from all ad hoc speakers
   -  Clears the liveSpeakers array
   -  Removes the email address from the author information

## Purpose

This script was created to comply with data privacy regulations by ensuring personal email addresses are not stored in livestream documents where they are not needed for functionality.

## Usage

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/removePersonalEmailData
```

## Dry Run Mode

The script includes a `DRY_RUN` constant (set to `false` by default) that can be modified to test the migration without making actual changes to the database.

To run in dry run mode, set `DRY_RUN = true` in the script before running.

# Dedupe universities by country

Removes duplicate universities on the database and syncs the changes to the `userData` collection.

## What it does

This script goes through all the items in the collection `universitiesByCountry` and dedupes them, removing any duplicates.
This script does not care about which university is the original one and which is the duplicate, it just removes the duplicates, leaving only unique universities.

## Deleted universities sync

Some deleted universities might be in usage on the `userData` collection. This script will find all the users that have these universities and update their university to the new one.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/dedupeUniversitiesByCountry
```

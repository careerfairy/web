# Reconcile fields of study

This script goes through all the users and and fields of study, filtering users using invalid fields of study
both in terms of `id` and `name`.

Users with invalid fields of study are then reconciled with the fields of study in the `fieldsOfStudy` collection, using
the levenshtein distance algorithm.

Constant `MIN_LEVEN_DISTANCE` is used to determine the minimum distance between the user's field of study and the fields of study in the `fieldsOfStudy` collection. **A default value of 5 is used.**

[Levenshtein distance algorithm info](https://en.wikipedia.org/wiki/Levenshtein_distance)

## Current production data (as of 2025-02-05)

-  Around 17339 users have invalid fields of study.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/reconcileFieldsOfStudy
```

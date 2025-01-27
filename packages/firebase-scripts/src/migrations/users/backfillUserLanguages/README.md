# Back-fill User Languages

With the restructuring of the `spokenLanguages` field to a sub collection (`userData/languages`), the current values of `spokenLanguages` need to be backfilled to the new sub collection.

## Rules

Based on current user `spokenLanguages` fill the new sub collection `languages` with the language id and the default
proficiency of `Advanced` for all users present in collection `userData`.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/users/backfillUserLanguages
```

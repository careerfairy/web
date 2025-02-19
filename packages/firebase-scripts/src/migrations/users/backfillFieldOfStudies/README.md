# Back-fill Field of Studies

With the introduction of the `category` field in the `fieldOfStudy` collection, the `fieldOfStudy` field in the `userData` collection needs to be backfilled with the `category` field from the `fieldOfStudy` collection.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/users/backfillFieldOfStudies
```

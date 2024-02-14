# Back-fill Public Group Fields

The purpose of this migration is to add the `targetedCountries`, `targetedFieldsOfStudy`, `targetedUniversities`, `companyIndustries`, `companyCountry`, `companySize` and `plan` fields from the `Group` document to the `PublicGroup` type.

It's required to update the following collections:

-  sparks
-  sparks/{sparkId}/SparkStats
-  userData/{userEmail}/companiesUserFollows

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/backfillPublicGroupFields
```

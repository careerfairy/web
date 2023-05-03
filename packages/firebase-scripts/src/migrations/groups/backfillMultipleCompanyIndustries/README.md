# Back-fill Group Multiple Company industries

Will fetch all the Groups in memory, loop through them and change the companyIndustry field for companyIndustries.
Updating this field to be an array where the first position will be filed with the companyIndustry value if any.

### Groups that are updated

```
{
    ...
    companyIndustries: [
      {
        "id": "Agriculture",
        "name": "Agriculture"
      },
      {
        "id": "Chemical",
        "name": "Chemical"
      },
      {
        "id": "Finance&Banking",
        "name": "Finance & Banking"
      }
    ]
    ...
}
```

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/backfillMultipleCompanyIndustries
```

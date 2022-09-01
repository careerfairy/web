### Save Field Of Study Mappings To Json

Steps for this script:

1. Open [this Google sheet](https://docs.google.com/spreadsheets/d/1zjn1qZOX4H_7AJkwQs2H7TONL1CxZdjfbDqvZUPFQu8/edit?usp=sharing)

2. On the left of the Google sheet document are all the legacy field of study names that are being used by all the
   groups on CF, and on the right are the new pre-defined fields of studies that you will have to create. Each legacy
   field of study on the left must be tied to one of the predefined fields of study on the right.
3. Save the Google sheet as a csv file in the `packages/firebase-scripts/data` folder with the
   name `exportedFieldAndLevelOfStudyMapping.csv`.
4. Run the script:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/fieldsOfStudy/saveFieldAndLevelOfStudyMappingsToJson
```

#### What it does:

The script will then create a JSON file in the `packages/firebase-scripts/data` folder with the
name `fieldAndLevelOfStudyMapping.json`
containing the mapping between the legacy field of study names and the new field of study IDs. That will be
used by the migration scripts

# Back-fill Groups with Search trigrams

Will fetch all groups, generate the trigrams from the group universityName & description and save this new field.

No other fields will be updated.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/backFillGroupTriGrams
```

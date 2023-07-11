# Back-fill Group Stats

We are required to modify all entries in the database related to groups and livestreams, specifically where the company size is marked as "1001+". The new value to be set for these records should be "1001-3000". :).

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/backFillGroupCompanySize
```

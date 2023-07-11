# Back-fill Group Stats

Will fetch all the livestream stats in memory, loop through all the connected groups and
sum up the stats for each group. The stats that are not set by this script will not be overwritten by this merge :).

### Group Stats that are updated (general and per university code):

-  numberOfParticipants
-  numberOfRegistrations
-  numberOfApplications
-  numberOfPeopleReached

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/backFillGroupStats
```

# Back-fill Live Stream Stats

Will fetch all the userLivestreamData and aggregate their stats in memory.
Once aggregated in memory, it will SET the stats for each livestream in batches of 200.
The script is designed to be run multiple times in case it fails or times out.
It will only update the specific stats as opposed to overwriting the entire stats object.

### Stats that are updated (general and per university code):

-  numberOfParticipants
-  numberOfRegistrations
-  numberOfTalentPoolProfiles
-  numberOfApplicants

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamStats
```

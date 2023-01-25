# Backfill Users Talent Profiles

Fetches all livestreams and for each user registered in the talentpool, inserts a new document into `userData/:user/talentProfiles/:groupId` for each group in the livestream.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillTalentProfiles
```

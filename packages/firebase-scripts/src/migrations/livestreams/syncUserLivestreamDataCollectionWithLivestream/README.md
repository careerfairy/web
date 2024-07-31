### Sync UserLivestreamData Collection With Livestream:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/syncUserLivestreamDataCollectionWithLivestream
```

#### What it does:

Goes through every UserLivestreamData document through a collection group query figures
out if the user has registered/participated/joined talentpool based on that, we then
add/remove the user's email from participatingStudents/talentPool array of emails fields
on the livestream document

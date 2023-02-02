### Add participated field to all UserLivestreamData after Jan 31 2023:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/addParticipatedField
```

#### What it does:

It goes through all livestreams after Jan 31 2023 and adds a `participated` field as null to all the userLivestreamData documents

Example Output of `userLivestream/{userEmail}` document:

```sh
{
  "answers": {},
  "livestreamId": "4Y7N5oAPpooemptigtE9",
  "participated": null,
  "registered": {...},
  "user": {...},
  "userId": "bUiW4iK6ZwidBdd4RN5njIdc5meu"
}
```

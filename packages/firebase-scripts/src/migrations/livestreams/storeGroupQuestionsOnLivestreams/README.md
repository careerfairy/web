### Backfill Livestreams Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/storeGroupQuestionsOnLivestreams
```

#### What it does:

Goes through every livestream in the livestreams collection and for every groupId
in the groupIds field, we get the group questions and question options and store
them on the livestream document.

Example Output of `livestream/{livestreamId}` document:

```sh
{
  ...livestreamData,
  groupQuestionsMap:{
    [groupId]:{
      groupName: "KPMG"
      groupId: "groupId"
      questions: {
        [questionId]:{
          id: "questionId",
          name: "What is your gender",
          hidden?: false,
          questionType: "custom" | "fieldOfStudy" | "levelOfStudy"
          options:{
            optionId1:{
              id: "optionId1",
              name: "male"
            }
            optionId2:{
              id: "optionId2",
              name: "female"
            }
          }
        }
      }
    }
  }
}
```

### Backfill UserData Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillUsers targetBackfill=userData
```

#### What it does:

Goes through every user in the userData collection and try to figure their legacy field of study based on their group
registration data. If a legacy field of study is found it will look at the JSON file
in `packages/firebase-scripts/data/fieldAndLevelOfStudyMapping.json`([how to generate this file](../../../scripts/fieldsOfStudy/saveFieldAndLevelOfStudyMappingsToJson/README.md#Save Field Of Study Mappings To Json))
and map the legacy field of study to the new field of studies and add the corresponding ID to the fieldOfStudy field on
the user data document.

In the example bellow, lets say the user has a legacy field of study of `microelectronics`
in the JSON file we can see that the mapping ID for `microelectronics` is 1 which is the key for `Engineering` in
the `newFieldOfStudies` object. We will then update the user data document with the new field of study ID. like so

![img_2.png](img_2.png)

Example Output:

```sh
{
  ...userData,
  fieldOfStudy:{
    id: 1,
    name: "Engineering"
  },
  levelOfStudy: {
    id: 3,
    name: "Bachelor"
  },
  university: {
      groupId: "groupId"
      code: "universityCode"
      name: "University of California, Berkeley"
      questions: {
        [questionId]:{
          questionName: "What is you gender",
          questionId: "string",
          answerId: "string",
          answerName: "male",
        }
      }
  }
  backfills: [ "backfilledFieldOfStudy"] // <-- array of backfill ids
}
```

### Backfill TalentPool/Registered/Participating Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillUsers (targetBackfill=registeredStudent OR targetBackfill=participatingStudent OR targetBackfill=talentPoolStudent)
```

#### What it does:

-  Goes through every user in the talentPool/registered/participating collection and maps their data to a new single
   collection in `livestreams/{livestreamId}/userLivestreamData`
-  Finds and stores field and level of study just like in [backfill userData collection script](#Backfill UserData Collection:)
-  Finds and converts the category selections for the document's registered groups as a dictionary field
   called `livestreamGroupQuestionAnswers`
-  talentPool/registered/participating sub-collections are never updated/deleted, their data is just mapped and merged
   into the new collection in `livestreams/{livestreamId}/userLivestreamData`.

Interface of the `livestreams/{livestreamId}/userLivestreamData` document:

```sh
{
  user:{
    ...userData,
  },
  userId: "authId",
  talentPool:{
    date: Timestamp
    companyId: string,
  },
  participating:{
    date: Timestamp
  },
  registered:{
    date: Timestamp,
    referral: {
         referralCode: string,
         inviteLivestream: string
    },
    utm: any
  },
  livestreamId: "streamId",
  answers: { // <-- Dictionary of group question answers
    [groupId]: {
      [questionId]:[answerId]
    }
  }
}
```

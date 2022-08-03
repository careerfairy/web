# Firebase scripts

script syntax:

###Target Dev:
Emulators must be running before running this script is executed.

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=<path-to-script>
```

###Target Prod:
For prod a manual confirmation prompt will appear in the terminal before running the script.

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=<path-to-script> useProd="true"
```

## Migrations

### createNewFieldsOfStudyInFirestore

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/createNewFieldsOfStudyInFirestore
```

#### What it does:

This script will create/replace the `fieldOfStudy` and `levelOfStudy`collections based on the JSON file
in `packages/firebase-scripts/data/fieldOfStudyMapping.json`([how to generate this file](#Save Field Of Study Mappings To Json))
. It will look at the `newFieldOfStudies`
property in the JSON file and create/replace the collection. The key will be the document id and the value will be the
label field value in the document data.

Example:

![img_1.png](img_1.png)

### Backfill UserData Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/backfillCategories targetBackfill=userData
```

#### What it does:

Goes through every user in the userData collection and try to figure their legacy field of study based on their group
registration data. If a legacy field of study is found it will look at the JSON file
in `packages/firebase-scripts/data/fieldOfStudyMapping.json`([how to generate this file](#Save Field Of Study Mappings To Json))
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
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/backfillCategories (targetBackfill=registeredStudent OR targetBackfill=participatingStudent OR targetBackfill=talentPoolStudent)
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
  ...backfilledUserData,
  userHas:["joinedTalentPool","participatedInLivestream","registeredToLivestream"],
  livestreamId: "streamId",
  dateJoinedTalentPool?: "Timestamp",
  dateParticipatedInLivestream?: "Timestamp",
  dateRegisteredToLivestream?: "Timestamp",
  livestreamGroupQuestionAnswers: { // <-- Dictionary of group question answers
    [groupId]: {
      [questionId]:[answerId]
    }
  }
}
```

### Backfill CareerCenterData Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/backfillCategories targetBackfill=careerCenterData
```

#### What it does:

Goes through every group in the careerCenterData collection and converts
`group.categories` field into a sub-collection of group questions
in `careerCenterData/{groupId}/groupQuestions/${questionId}`

Example Output of `careerCenterData/{groupId}/groupQuestions/${questionId}` document:

```sh
{
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
```

### Backfill Livestreams Collection:

````sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/backfillCategories targetBackfill=livestreams```
````

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

## Scripts

### Save Field Of Study Mappings To Json

Steps for this script:

1. Open [this Google sheet](https://docs.google.com/spreadsheets/d/1MeLhVaEq-ev02JjGdLg6Yx7-mAAgGDOPvSgBaAChBO0/edit?usp=sharing)

2. On the left of the Google sheet document are all the legacy field of study names that are being used by all the
   groups on CF, and on the right are the new pre-defined fields of studies that you will have to create. Each legacy
   field of study on the left must be tied to one of the predefined fields of study on the right.
3. Save the Google sheet as a csv file in the `packages/firebase-scripts/data` folder with the
   name `exportedFieldOfStudyMapping.csv`.
4. Run the script:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/saveFieldOfStudyMappingsToJson
```

#### What it does:

The script will then create a JSON file in the `packages/firebase-scripts/data` folder with the
name `fieldOfStudyMapping.json`
containing the mapping between the legacy field of study names and the new field of study IDs. That will be
used by the migration scripts

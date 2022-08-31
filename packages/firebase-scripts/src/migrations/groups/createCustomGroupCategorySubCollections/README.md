### Backfill CareerCenterData Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/groups/createCustomGroupCategorySubCollections
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

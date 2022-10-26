### Backfill CareerCenterData Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/universitiesByCountry/backfillCountryIds
```

#### What it does:

Goes through every University by Country in the careerCenterData collection and adds a
`countryId` field all the documents
in `careerCenterData/{groupId}/groupQuestions/${questionId}`

Example Output of `careerCenterData/universitiesByCountry/AD` document:

```sh
{
  countryId: "AD",
  universities: [
    {
      id: "8cd0914e-469c-429f-b150-9f3a05e76a15",
      name: "University of Andorra",
      webPage: "",
    },
    {
      id: "fa840c21-f19f-448a-9119-c6782e556f82",
      name: "University of Andorra",
      webPage: "",
    },
  ]
}
```

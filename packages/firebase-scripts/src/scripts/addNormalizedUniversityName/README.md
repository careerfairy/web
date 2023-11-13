### Add addNormalizedUniversityName field on CareerCenterData's documents:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/addNormalizedUniversityName
```

#### What it does:

It goes through all CareerCenterData documents and adds a new `normalizedUniversityName` field that is a duplication of the current `universityName` but in lowerCase.

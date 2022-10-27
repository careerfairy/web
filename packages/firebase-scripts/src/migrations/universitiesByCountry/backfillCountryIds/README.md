### Backfill UniversitiesByCountry Collection:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/universitiesByCountry/backfillCountryIds
```

#### What it does:

It goes through every country in the universitiesByCountry collection and adds the respective `countryId` field to every document
in `universitiesByCountry/{countryId}`

Example Output of `universitiesByCountry/AD` document:

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

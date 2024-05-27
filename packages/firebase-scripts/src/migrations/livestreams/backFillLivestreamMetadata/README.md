# Back-fill Live Stream Metadata

Will fetch all live streams and groups, then look at all the live stream hosts
and cascade their metadata to the live stream document.

The metadata that is cascaded is:

-  companyIndustry
-  companySize
-  companyCountry
-  companyTargetedCountries
-  companyTargetFieldsOfStudies
-  companyTargetUniversities

## Rules

If the livestream has a company host, then the metadata will be ONLY taken from the company host(s)
and not from the university host(s).

If there are no company hosts, then the metadata will be taken from the university host(s).

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillLivestreamMetadata
```

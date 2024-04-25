# Back-fill Custom Job (Job Applications) Metadata

Will fetch all custom jobs and groups, then look at all the job hosts
and cascade their metadata to the live stream document.

The metadata that is cascaded is:

-  companyIndustries
-  companySize
-  companyCountry

## Rules

The metadata is only updated if any of the specific fields are altered in any way

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/jobs/backFillJobsMetadata
```

# Back-fill Custom Job Applications Metadata

Will fetch all custom job applications (collection /jobApllications) and groups, then look at all the job application hosts (group/company)
and cascade their metadata to the jobApllications/{id} document.

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

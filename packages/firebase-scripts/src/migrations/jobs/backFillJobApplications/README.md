# Back-fill Custom Job Applications with additional data

Will fetch all custom job applications (collection /jobApplications), then set new field 'completed' as true, since the application is already confirmed.

## Why ?

This backfill is needed as for the new job hub concept users will be able to check their job applications split in those which were initiated (clicked on apply but did not confirm application done, basically when clicking on job external link) and the applications which the user confirmed that it was fully completed, which translates to new field 'completed'. Currently any document in /jobApplications means the user has confirmed the application so the 'completed' flag for all existing documents must be set as 'true'.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/jobs/backFillJobApplications
```

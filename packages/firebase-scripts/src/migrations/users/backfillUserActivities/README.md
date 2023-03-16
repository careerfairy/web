# Backfill User Activities

Ticket: https://linear.app/careerfairy/issue/CF-285/track-user-activities

Creates `/userData/$id/activities/` based on past user actions (livestream registrations/participations/recordings watched).

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillUserActivities
```

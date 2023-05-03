# Backfill User Credits

Ticket: CF-375.

Updates every `userData` document:

-  Gives 3 credits to every existing account
-  Removes `points` field

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/backfillUserCredits

```

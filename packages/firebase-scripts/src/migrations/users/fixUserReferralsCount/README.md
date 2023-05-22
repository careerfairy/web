# Fix User referralsCount

Ticket: CF-431.

Updates the `userData` documents:

-  Removes the fields `referralsCount` and `totalLivestreamInvites`

Updates the `userStats` documents:

-  Sums the previous values on `userData.referralsCounter`, `userData.totalLivestreamInvites`
   with the current ones on the `userStats documents`

## Run

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/fixUserReferralsCount

```

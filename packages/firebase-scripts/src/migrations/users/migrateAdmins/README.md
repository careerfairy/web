### Migrate roles:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/migrateAdmins
```

#### What it does:

Goes through every admin of a group by looking at the careerCenterData/admins sub-collection then assigns them
the new role model, role claims and admin groups sub-collection

Example Output:

```sh

```

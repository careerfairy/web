### Migrate roles:

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/users/migrateLegacyAdminsToNewAdmins
```

### What it does:

Goes through every admin of a group by looking at the legacy admin in `careerCenterData/admins/[email]` sub-collection then assigns them
the new admin role in firestore under the group's admin sub-collection `careerCenterData/groupAdmins/[email]` with complementary data.

### Legacy Input:

`careerCenterData/admins/[email]`

```sh
{
   role: "mainAdmin" | "subAdmin"
}
```

### New Output:

`careerCenterData/groupAdmins/[email]`

To render the roles table, in the group dashboard

```sh
{
   role: "OWNER" | "MEMBER"
   firstName: "John"
   lastName: "Doe"
   displayName: "John Doe"
   email: "johnDoe@example.com"
   groupId: "groupId"
}
```

`userData/userAdminGroups/[groupId]`

For easy access to the groups the user is an admin of on their profile page

```sh
{
   userId: "userId"
   id: "groupId"
   description: "Group Description"
   logoUrl: "Group Logo Url"
   extraInfo: "Group Extra Info"
   universityName: "Group Name"
   universityCode: "Group University Code"
}
```

`AuthUserRecord.customClaims`

For validating the users permissions in the firebase rules and for access in the group dashboard

```sh
{
   adminGroups: {
      [groupId]: {
         role: "OWNER" | "MEMBER"
       }
   }
}
```

### Additional info:

If any of the migrations fail, the script will save the failed migration in an array and export it to file in `web/packages/firebase-scripts/data/failedAdminMigrations.json`
containing the admins email target role and group.

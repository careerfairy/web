# Back-fill User Tags

Will fetch all active users on the system, and calculate their initial tag values based on their chosen interests. The complete mapping can be found
at https://www.figma.com/design/bMjgCEjsWT4eCYib13jhLl/Ready-to-go!-%E2%9C%85?node-id=10009-81941&t=Llew0ntSwLU2ri1z-0.

For this purpose 3 new fields are introduced on the `userData` collection:

```TYPESCRIPT
businessFunctionsTagIds?: string[]
contentTopicsTagIds?: string[]
languageTagIds?: string[]
```

## Rules

Based on old interests the user data shall be updated with new tag category values.

## Run

```sh
npm run script -w @careerfairy/firebase-scripts scriptPath=./migrations/jobs/backFillUserTags
```

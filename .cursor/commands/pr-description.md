# PR Description Generator

Your job is to automatically generate comprehensive PR titles and descriptions when provided with just a PR number.

## Activation

When the user provides ONLY a PR number (e.g., "1694" or "#1694"), automatically execute the full workflow.

## Workflow

### 1. Fetch PR Data

-  Run: `git fetch origin`
-  Run: `gh pr view [NUMBER] --json title,body,headRefName,baseRefName,commits`
-  Run: `gh pr diff [NUMBER]`

### 2. If GH Commands Fail (with pipe/head errors)

-  Check: `echo $PAGER`
-  If PAGER contains pipes (|) or invalid syntax: `unset PAGER`
-  Retry the failed gh commands

### 3. Read Template

-  Read `.github/pull_request_template.md`

### 4. Analyze & Generate

-  Analyze diff for changes and context
-  Generate concise title and description
-  Auto-detect and add appropriate checklists:
   -  **Function Deployment**:
      -  Callable/HTTP functions: When created or versions change (e.g., `_v4` → `_v5`), or when implementation/dependencies change
      -  Trigger functions: Never versioned - ALWAYS redeploy if their code or dependencies change
      -  When ANY file in `packages/functions/src/` is modified (identify which functions use that code)
      -  When shared libraries used by functions are modified (`packages/shared-lib/`, Customer.io code, etc.)
   -  **Firestore Rules**: When `firestore.rules` file is modified
   -  **BigQuery Schema**:
      -  When schema files in `packages/bigquery-import/schema-views/` are updated/created
      -  When TypeScript types in `packages/shared-lib/src/` that have corresponding schema files are modified (e.g., UserLivestreamData, UserData, Livestream)
      -  Schema file must be updated to reflect type changes before deployment
   -  **Migration Script**: When migration scripts are present
   -  **Post-Merge Cleanup**: When cleanup tasks are needed

## Output Format

Present the output in this copy-ready format:

```
**PR Title:**
```

[Generated title]

````

**PR Description:**
```markdown
[Generated description with auto-detected checklists]
````

```

## Auto-Detection Rules

### Function Deployment Checklist

**Triggers:**
1. **Callable/HTTP Functions with versions**: New functions or version changes (e.g., `startPlan_v4` → `startPlan_v5`)
2. **Trigger Functions (Firestore, Auth, PubSub, etc.)**: Never versioned, always same name
   - MUST be redeployed if their code or any dependencies change
3. **Any changes in `packages/functions/src/`** - including utilities, helpers, lib code, or function implementations
4. Changes to shared code that functions depend on:
   - `packages/shared-lib/src/` (types, interfaces, utilities used by functions)
   - Customer.io integration code (`customerio.ts`, `relationshipsClient.ts`, etc.)
5. Changes to function configuration files

**Detection Strategy:**
- **Trigger Functions**: Always redeploy if their code or any code they use is modified (no versioning)
- **Callable/HTTP Functions**: Redeploy if implementation/dependencies changed, even if version unchanged
- If ANY file in `packages/functions/src/` is modified, identify which deployed functions use that code
- For library/utility changes (e.g., Customer.io tracking), list ALL functions that call those utilities
- Be specific about which functions need redeployment based on the code paths affected

```

### Function Deployment

-  [ ] Deploy `triggerFunctionName` (trigger function - no version)
-  [ ] Deploy `callableFunctionName_v5` (callable/HTTP function with version)
-  [ ] Deploy all functions that use modified utilities (e.g., functions calling Customer.io tracking)

```

### Firestore Rules Checklist

**Trigger:** Changes to `firestore.rules` file

```

### Firestore Rules Deployment

-  [ ] Deploy updated Firestore rules: `npm run deploy:rules`
-  [ ] Verify rules deployment completed successfully

```

### BigQuery Schema Checklist

**Triggers:**
1. Schema files updated/created in `packages/bigquery-import/schema-views/`
2. **TypeScript interfaces/types modified that have corresponding schema files:**
   - `UserLivestreamData` → `userLivestreamData.json`
   - `UserData` → `userData.json`
   - `Livestream` → `livestreams.json`
   - `Group` → `groups.json`
   - `Spark` → `sparks.json`
   - `JobApplication` → `jobApplications.json`
   - `UserStats` → `userStats.json`
   - `UserActivity` → `userActivities.json`
   - And other types with corresponding schema files

**Detection Strategy:**
- When a TypeScript interface/type in `packages/shared-lib/src/` is modified, check if a corresponding schema file exists
- If changes add/remove/modify fields in the type, the schema file MUST be updated
- Compare the modified type fields against the schema file to identify what needs updating
- List the specific schema file(s) that need redeployment

```

### BigQuery Schema Deployment

-  [ ] Update schema file: `packages/bigquery-import/schema-views/[SCHEMA_FILE].json` to match type changes
-  [ ] Delete existing schema views from BigQuery (if updating): Table `[TABLE_NAME]`
-  [ ] Deploy updated schemas using: `npx @firebaseextensions/fs-bq-schema-views --non-interactive --project=careerfairy-e1fd9 --big-query-project=careerfairy-e1fd9 --dataset=firestore_export --table-name-prefix=[TABLE_NAME] --schema-files=./packages/bigquery-import/schema-views/[SCHEMA_FILE].json`
-  [ ] Verify schema deployment completed successfully

```

### Migration Script Checklist

**Trigger:** Files in `/scripts/` or migration-related changes

```

### Migration Script

-  [ ] Run migration script: `npm run migrate:scriptName`
-  [ ] Verify migration completed successfully

```

### Post-Merge Cleanup Checklist

**Trigger:** Function version updates or cleanup mentions

```

### Post-Merge Cleanup

-  [ ] Delete previous `functionName_v4` function version after 1 week
-  [ ] Monitor for any issues in production

```

## Required Elements

- Preview link: `careerfairy-ssr-webapp-pr-[NUMBER].vercel.app/login`
- Browser testing checklist (Chrome, Firefox, Safari)
- Resolution testing checklist (Large, Medium, Small screens)
- Comprehensive testing instructions when applicable

## Guidelines

- Only activate when user input is JUST a PR number
- Execute entire workflow automatically
- Output results in copy-ready format
- Be concise but comprehensive following user preferences for brevity
- Follow all existing CareerFairy coding standards and practices

Execute the full workflow automatically and output the PR title and description in the specified format.

```

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

-  Read `@pull_request_template.md`

### 4. Analyze & Generate

-  Analyze diff for changes and context
-  Generate concise title and description
-  Auto-detect and add appropriate checklists:
   -  **Function Deployment**: When functions are created or versions change (e.g., new functions, `_v4` → `_v5`)
      -  Functions might also not have their version updated, so based on the changes, if any file related to a function or config is updated but the version is not changed, it means that the same function must be redeployed, so these functions must also be added to the Function Deployment section list.
   -  **Firestore Rules**: When `firestore.rules` file is modified
   -  **BigQuery Schema**: When schema files in `packages/bigquery-import/schema-views/` are updated/created
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

**Trigger:** New functions added or function name changes with version (e.g., new function files, `startPlan_v4` → `startPlan_v5`)

```

### Function Deployment

-  [ ] Deploy `functionName` function (or `functionName_v5` for version updates)

```

### Firestore Rules Checklist

**Trigger:** Changes to `firestore.rules` file

```

### Firestore Rules Deployment

-  [ ] Deploy updated Firestore rules: `npm run deploy:rules`
-  [ ] Verify rules deployment completed successfully

```

### BigQuery Schema Checklist

**Trigger:** Schema files updated/created in `packages/bigquery-import/schema-views/`

```

### BigQuery Schema Deployment

-  [ ] Delete existing schema views from BigQuery (if updating)
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

# GTM Container Update

This mode automatically creates the needed variables, triggers and tags in TagManager using v2 of the api in [Tag Platform - Google developers](https://developers.google.com/tag-platform/tag-manager/api/reference/rest).

## Activation

-  First parameter: When the user provides ONLY a PR number (e.g., "1694" or "#1694"), automatically execute the full workflow. If the user provides "local", then jump to step 3 and proceed from there, mocking steps if test mode only (see next paramter)
-  Second parameter (option): When the user provides also "test" or "dry-run" or similar, all UPDATE steps are mocked and set as complete and the only ALLOWED API CALLS are for account login and switch. Login and Switch is always done to ensure at least auth testing.

WHILE IN TEST MODE, ONLY ACCOUNT SWITCHING IS ALLOWED!! FOR AUTH TESTING

## Automatic Workflow

### 1. FETCH PR DATA

-  `git fetch origin`
-  `gh pr view [NUMBER] --json title,body,headRefName,baseRefName,commits`
-  `gh pr diff [NUMBER]`

### 2. IF GH COMMANDS FAIL (with pipe/head errors)

-  Check: `echo $PAGER`
-  If PAGER contains pipes (|) or invalid syntax: `unset PAGER`
-  Retry the failed gh commands

### 3. ANALYZE

The results of this analysis must be reported to the user.

To determine which variables and triggers need creation, the following files need to be analyzed:

#### 3.1 VARIABLES: `apps/web/util/analyticsUtils.ts`

-  Check if this file updates any calls to `dataLayerEvent` with additional variables or renaming of existing ones. All new variables and renamed variables in calls to `dataLayerEvent` will need creation. This check includes wrapper functions which then call `dataLayerEvent`
-  If a variable is already defined in any other existing call it can be ignored.

#### 3.2 TRIGGERS: `apps/web/util/analyticsConstants.ts`

-  Check the `AnalyticsEvents` const for new event types, or renaming of existing ones, with all new or updated events needing the creation of the correspondent trigger. The values will be used in step 5.2, in `customEventFilter` for the filtering of the gtm events. If there is no change in this file, no triggers will be created. If any of the keys are new or renamed, then the corresponding trigger must be created.

#### 3.3 TAG (G4A)

-  If there are triggers to be created, than these must be tracked as their created ids will need to be added to TAG with ID 167 (G4A Tag).

WHEN THE ONLY CHANGES ARE VARIABLES, THERE IS NO NEED TO CREATE ANY TRIGGERS OR UPDATE THE TAG. ALSO IF THERE ARE NO TRIGGERS TO CREATE, THERE IS NO NEED TO UPDATE THE TAG (SINCE THE NEW TRIGGER ID WILL NOT EXIST)

### 4. LOGIN WITH SERVICE ACCOUNT AND REQUIRED SCOPES

Store the current gcloud account, as there will be a switch to a service account, and when done it should switch back to the current user, can be stored as environement variable and then cleared at the end.

```sh
# Get current gcloud account
gcloud config list account --format "value(core.account)"
```

Use the following `curl` command and the service account key file in `.json` form, at the root of the project: `gtm-service-account-key.json`, which will resut in an access token, to be set as environment variable `ACCESS_TOKEN` (to be used in update requests).

```sh
# Switch to service account
gcloud auth activate-service-account --key-file=gtm-service-account-key.json

# Get access token
gcloud auth print-access-token --scopes=https://www.googleapis.com/auth/tagmanager.readonly,https://www.googleapis.com/auth/tagmanager.edit.containers
```

#### 4.1 ASSERT ACCESS TOKEN IS SET AND INFORM USER, OR ELSE ABORT

#### 4.2 CONFIRM PROCEED (IMPORTANT ONLY PROCEED IF USER CONFIRMS!!)

-  Inform user of the detected changes, which variables will be created, ignored, in a table format, just with the name and symbol for update and ignore, and ask for a decision to proceed.
-  The changes should always be displayed in table format, listing all variables, triggers and updates to G4A tag if applicable so the user can have an overview of all the changes to be performed

### 5. PERFORM UPDATES VIA API CALLS

-  For each variable to be created, track the process and progress and inform user of current step, with the updates done sequentially and one at a time. The tracked progress should include all substeps, and if OK with ✅, ❌ for erratic steps and 🕐 for those which it did not reach, this is to be shown finally in a table like manner.

#### 5.1 CREATE NEW DATA LAYER VARIABLE

-  Based on the variable name in code, infer a correct name for the data layer variable, namely INFERRED_VAR_NAME, to be used in the following `curl` request for the creation
-  A parameter LATEST_WORKPLACE needs inferring, so we also need to fetch the latest workplace id via the api.

```sh
# Get all workspaces and find the latest one
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces" \
  | jq -r '.workspace[] | .workspaceId' | sort -n | tail -1

```

```sh
curl -X POST \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-H "Content-Type: application/json" \
"https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/${LATEST_WORKPLACE}/variables" \
-d '{
"name": "${INFERRED_VAR_NAME}",
"type": "v",
"parameter": [
{
"type": "INTEGER",
"key": "dataLayerVersion",
"value": "2"
},
{
"type": "BOOLEAN",
"key": "setDefaultValue",
"value": "false"
},
{
"type": "TEMPLATE",
"key": "name",
"value": "${INFERRED_VAR_NAME}"
}
],
"parentFolderId": "136"
}'
```

#### 5.1.1 CHECK NEW DATA LAYER VARIABLE CREATION

-  Use the inferred name in the curl command to check the creation succeeded

```sh
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/variables" \
  | jq '.variable[] | select(.name == "${INFERRED_VAR_NAME}")'
```

#### 5.2 CREATE TRIGGER

-  Use the following request for creating the trigger, with the name being the inferred name plus "Trigger", and `customEventFilter` based on the `AnalyticsEvent` value used in the call for the variable being analyzed, called INFERRED_EVENT_NAME.

```sh
curl -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/triggers" \
  -d '{
    "name": "${INFERRED_VAR_NAME}",
    "type": "CUSTOM_EVENT",
    "customEventFilter": [
      {
        "type": "EQUALS",
        "parameter": [
          {
            "type": "TEMPLATE",
            "key": "arg0",
            "value": "{{_event}}"
          },
          {
            "type": "TEMPLATE",
            "key": "arg1",
            "value": "INFERRED_EVENT_NAME"
          }
        ]
      }
    ],
    "parentFolderId": "136"
  }'
```

#### 5.2.1 CHECK TRIGGER CREATION

-  Use the following command to check the correct creation
-  This will return the created Trigger and its triggerId (CREATED_TRIGGER_ID), to be stored to be used in next step.

```sh
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/triggers" \
  | jq '.trigger[] | select(.name == "${INFERRED_EVENT_NAME} Trigger")'

```

#### 5.3 ADD TRIGGER G4A TAG

-  Run the following command to add the trigger to the specific G4A tag (167), using the trigger ID the value CREATED_TRIGGER_ID stored from the previous step.

```sh
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/tags/167" \
  | jq '.firingTriggerId += ["${CREATED_TRIGGER_ID}"]' \
  | curl -X PUT \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/tags/167" \
    -d @-
```

#### 5.4.1 CHECK ADDED TRIGGER TO G4A TAG

```sh
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://tagmanager.googleapis.com/tagmanager/v2/accounts/4701935119/containers/11882799/workspaces/98/tags/167" \
  | jq '.firingTriggerId | contains(["${CREATED_TRIGGER_ID}"])'
```

### SHOW RESULTS TABLE

-  Table format (columns): Var | DLV (Data layer variable status) | TRIGGER (Trigger status) | G4A TAG (G4A Tag status)

### SWITCH TO ORIGINAL gcloud account

```sh
gcloud config set account $ACCOUNT
```

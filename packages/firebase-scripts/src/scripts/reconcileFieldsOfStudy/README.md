# Reconcile fields of study

This script goes through all the users and fields of study, filtering users using invalid fields of study
both in terms of `id` and `name`.

Users with invalid fields of study are then reconciled based on the `id` field.

## Usage

To run the script, use the following command:

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./scripts/reconcileFieldsOfStudy
```

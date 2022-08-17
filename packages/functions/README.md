# Firebase Functions

## Secrets

There are some sensitive keys that we store in GCloud Secret Manager, those keys are injected into the functions as environment variables.

The first 6 secrets are free, after that check the pricing.

### Google Cloud Secret Manager

Current Secrets:

-  MERGE_ACCESS_KEY

#### Example commands:

```sh
# Change the value of an existing secret
npx firebase functions:secrets:set SECRET_NAME

# View the value of a secret
npx firebase functions:secrets:access SECRET_NAME

# Destroy a secret
npx functions:secrets:destroy SECRET_NAME

# View all secret versions and their state
npx functions:secrets:get SECRET_NAME

# Automatically clean up all secrets that aren't referenced by any of your functions
npx functions:secrets:prune

# Run the commands from the root folder
# More docs: https://firebase.google.com/docs/functions/config-env#managing_secrets
```

Docs: https://firebase.google.com/docs/functions/config-env#secret-manager

### Local Emulators

They will load the secrets on the file `.secrets.local`.

Docs: https://firebase.google.com/docs/functions/config-env#secrets_and_credentials_in_the_emulator

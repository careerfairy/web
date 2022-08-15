# Firebase scripts

script syntax:

###Target Dev:
Emulators must be running before running this script is executed.

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=<path-to-script>
```

###Target Prod:
For prod a manual confirmation prompt will appear in the terminal before running the script.

```sh
npm run script -w @careerfairy/firebase-scripts -- scriptPath=<path-to-script> useProd="true"
```

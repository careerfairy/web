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

##Category Migration Process:

Notes for using emulator:

-  [Disable](https://firebase.google.com/docs/emulator-suite/install_and_configure#enable_disable_background_function_triggers) trigger functions
-  Run the fetch-firestore-data script and ake sure the userData collection isn't being deleted after the import
-  The userData collection wont be visible in the emulator UI. Dont worry the users are still there, they just arent being rendered in order to prevent the emulator UI from crashing since there is no virtualization.

1. Download the latest mapping as CSV from [here](https://docs.google.com/spreadsheets/d/19u6uWLu39fb1t_7wipFgXNruD3yyAMT1qhxi3bIPzIo/edit?usp=sharing) and follow the instructions for converting it into a JSON mapping in this README [saveFieldAndLevelOfStudyMappingsToJson script](../src/scripts/fieldsOfStudy/saveFieldAndLevelOfStudyMappingsToJson/README.md).
2. Double check that `packages/firebase-scripts/data/fieldAndLevelOfStudyMapping.json` file exists and is correct
3. Run the [createNewFieldsAndLevelOfStudyInFirestore script](./migrations/fieldsOfStudy/createNewFieldsAndLevelOfStudyInFirestore/README.md) that will make the new field and level of study root collections
4. Double check in the emulators/Prod DB if the new collections exist
5. Run the [createCustomGroupCategorySubCollections script](./migrations/groups/createCustomGroupCategorySubCollections/README.md) that will convert group categories into a collection of questions found in `careerCenterData/{groupId}/groupQuestions`
6. Double check in the emulators/Prod DB that the questions sub-collections have been created. Note, if the group is not a university and only has field and level of study categories, no questions subcollection will be created.
7. Run the [storeGroupQuestionsOnLivestreams script](./migrations/livestreams/storeGroupQuestionsOnLivestreams/README.md) that backfills all livestreams with the questions and answers of the groups in the groupIds array field. It is possible that on the emulators the script
8. will stall if you have the UI or webapp running and listening to the livestreams collection
9. Double check in the emulators/Prod DB that the questions for the event are stored on the livestream
10.   Run the [backfillUserData script](./migrations/users/backfillUsers/README.md) that backfills the users with a field and level of study based on their event registrations and the mapping JSON file.
11.   Double check if your user has been assigned a field/level of study or null.
12.   Run this [backfill registered/participating/talentpool users script](./migrations/users/backfillUsers/README.md) first for talentPool, then participatingStudents and lastly registeredStudents.
13.   Double check that the new `livestreams/{livestreamId}/userLivestreamData` collections exist.
14.   If using emulators Migration is complete
15.   Merge PR into Develop then release
16.   Deploy cloud functions

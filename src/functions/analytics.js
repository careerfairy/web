const functions = require('firebase-functions');
const {admin} = require('./api/firestoreAdmin')


exports.updateGeneralUserAnalyticsStats = functions.firestore.document('userData/{userId}')
    .onUpdate((change, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();
        console.log("-> newValue", newValue);
        functions.logger.log("-> newValue", newValue)

        // ...or the previous value before this update
        const previousValue = change.before.data();
        console.log("-> previousValue", previousValue);
        functions.logger.log("-> previousValue", previousValue)
        // const db = admin.firestore();

    })
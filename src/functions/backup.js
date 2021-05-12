const functions = require('firebase-functions');


// Run this function every hour
exports.exportFirestoreBackup = functions.pubsub.schedule('every 1 hours').timeZone('Europe/Zurich').onRun((context) => {
    const firestore = require('@google-cloud/firestore');
    const client = new firestore.v1.FirestoreAdminClient();

    const dateNow = new Date(Date.now());
    const bucket = `gs://careerfairy-backup/${dateNow.toDateString()}-${dateNow.toTimeString()}`;

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName =
        client.databasePath(projectId, '(default)');

    return client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: []
    })
        .then(responses => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        })
        .catch(err => {
            console.error(err);
            throw new Error('Export operation failed');
        });
});
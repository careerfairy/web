const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const firebase = require('firebase');

// load values from the .env file in this directory into process.env
dotenv.config();

// configure firebase
console.log("-> process.env.REACT_APP_FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID);
firebase.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const database = firebase.firestore();

// configure algolia
const algolia = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
);
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);
// Get all groups from Firebase
database.collection('careerCenterData').get().then(snapShots => {
    console.log("-> snapShots", snapShots);
    // Build an array of all records to push to Algolia
    const records = [];
    snapShots.forEach(doc => {
        // get the key and data from the snapshot
        const childKey = doc.id;
        const childData = doc.data();
        delete childData.adminEmail
        // We set the Algolia objectID as the Firebase .key
        childData.objectID = childKey;
        // Add object for indexing
        console.log("-> records", records);
        records.push(childData);
    });

    // Add or update new objects
    index
        .saveObjects(records)
        .then(() => {
            console.log('Groups imported into Algolia');
        })
        .catch(error => {
            console.error('Error when importing group into Algolia', error);
            process.exit(1);
        });
});

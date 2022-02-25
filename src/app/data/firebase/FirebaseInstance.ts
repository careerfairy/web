import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import "firebase/functions";

const config = {
   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
   databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
};

/**
 * Create a custom firebase instance
 *
 * @param name Instance name
 * @param firestoreSettings
 */
export const createFirebaseInstance = (
   name: string,
   firestoreSettings?: firebase.firestore.Settings
): firebase.app.App => {
   const existingApp = firebase.apps.find((app) => app.name === name);
   if (existingApp) {
      return existingApp;
   }

   const app = firebase.initializeApp(config, name);

   if (firestoreSettings) {
      app.firestore().settings(firestoreSettings);
   }

   // if (
   //    process.env.NODE_ENV === "development" &&
   //    process.env.FIREBASE_EMULATORS
   // ) {
   //    firebaseInstance.auth().useEmulator("http://localhost:9099");
   //    firebaseInstance.firestore().useEmulator("localhost", 8080);
   //    firebaseInstance.functions().useEmulator("localhost", 5001);
   // }

   return app;
};

// Default instance that we can re-use, default settings for firestore, auth, etc
// [DEFAULT] app name is required for redux-firestore 🤦
const firebaseApp: firebase.app.App = createFirebaseInstance("[DEFAULT]");

export default firebaseApp;

/**
 * Mock Firebase
 */
module.exports = {
   apps: [],
   initializeApp: () => ({
      auth: () => ({
         onAuthStateChanged: () => {},
         onIdTokenChanged: () => {},
      }),
      firestore: () => ({
         settings: () => {},
         FieldValue: {},
      }),
      functions: () => {},
      storage: () => {},
   }),
   firestore: {
      FieldValue: {},
      Query: {},
   },
}

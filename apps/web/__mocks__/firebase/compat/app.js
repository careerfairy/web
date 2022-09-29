/**
 * Mock Firebase
 */
module.exports = {
   apps: [],
   initializeApp: () => ({
      auth: () => ({
         onAuthStateChanged: () => {},
         onIdTokenChanged: () => {},
         useEmulator: () => {},
      }),
      firestore: () => ({
         settings: () => {},
         FieldValue: {},
         useEmulator: () => {},
      }),
      functions: () => ({
         useEmulator: () => {},
      }),
      storage: () => ({
         useEmulator: () => {},
      }),
   }),
   firestore: {
      FieldValue: {},
      Query: {},
   },
}

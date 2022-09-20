/**
 * Mock react-redux-firebase
 *
 * This is a workaround for the following error:
 * TypeError: Cannot read property 'auth' of null
 *
 */
module.exports = {
   useFirebase: () => ({
      auth: () => ({
         currentUser: {
            getIdToken: () => {},
         },
      }),
   }),
}

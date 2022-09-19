import RootState from "../reducers"

export const firebaseAuthIsLoadedSelector = (state: RootState) =>
   state.firestore.auth.isLoaded

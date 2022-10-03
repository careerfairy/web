import RootState from "../reducers"

export const firebaseAuthIsLoadedSelector = (state: RootState) =>
   state.firebase.auth?.isLoaded

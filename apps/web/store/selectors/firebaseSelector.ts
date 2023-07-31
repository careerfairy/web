import { RootState } from "../"

export const firebaseAuthIsLoadedSelector = (state: RootState) =>
   state.firebase.auth?.isLoaded

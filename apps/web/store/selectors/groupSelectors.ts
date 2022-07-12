import RootState from "../reducers"

export const groupSelector = (state: RootState) => state.firestore.data.group

export const groupATSAccountsSelector = (state: RootState) =>
   state.firestore.data.ats

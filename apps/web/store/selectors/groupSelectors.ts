import { RootState } from "../"

export const groupSelector = (state: RootState) => state.firestore.data.group

export const groupATSAccountsSelector = (state: RootState) =>
   state.firestore.data.ats

export const notificationsSelector = (state: RootState) =>
   state.firestore.ordered.notifications || []

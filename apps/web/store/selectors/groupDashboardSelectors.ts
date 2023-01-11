import RootState from "../reducers"
export const leftMenuSelector = (state: RootState) =>
   state.groupDashboard.layout.leftDrawerOpen

export const notificationsSelector = (state: RootState) =>
   state.firestore.ordered.notifications || []

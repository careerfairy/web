import RootState from "../reducers"

export const isOnLandingPageSelector = (state: RootState): boolean =>
   state.generalLayout.layout.isOnLandingPage

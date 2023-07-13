import * as actions from "../actions/actionTypes"

interface GeneralLayoutState {
   layout: {
      drawerOpen: boolean
   }
}

const initialState = {
   layout: {
      drawerOpen: false,
      isOnLandingPage: false,
   },
} as GeneralLayoutState

const generalLayoutReducer = (
   state: GeneralLayoutState = initialState,
   { type }
) => {
   switch (type) {
      case actions.OPEN_NAV_DRAWER:
         return { ...state, layout: { ...state.layout, drawerOpen: true } }
      case actions.CLOSE_NAV_DRAWER:
         return { ...state, layout: { ...state.layout, drawerOpen: false } }
      case actions.TOGGLE_NAV_DRAWER:
         return {
            ...state,
            layout: { ...state.layout, drawerOpen: !state.layout.drawerOpen },
         }
      case actions.IN_LANDING_PAGE:
         return {
            ...state,
            layout: {
               ...state.layout,
               isOnLandingPage: true,
            },
         }
      case actions.OUT_OF_LANDING_PAGE:
         return {
            ...state,
            layout: {
               ...state.layout,
               isOnLandingPage: false,
            },
         }
      default:
         return state
   }
}

export default generalLayoutReducer

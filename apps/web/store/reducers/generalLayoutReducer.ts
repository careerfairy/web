import { Reducer } from "redux"
import * as actions from "../actions/actionTypes"

interface IGeneralLayoutState {
   layout: {
      drawerOpen: boolean
      isOnLandingPage: boolean
   }
}

const initialState: IGeneralLayoutState = {
   layout: {
      drawerOpen: false,
      isOnLandingPage: false,
   },
}

const generalLayoutReducer: Reducer<IGeneralLayoutState> = (
   state = initialState,
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

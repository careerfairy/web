import * as actions from "../actions/actionTypes"
import { GeneralLayoutState } from "./index"

const initialState = {
   layout: {
      drawerOpen: false,
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
      default:
         return state
   }
}

export default generalLayoutReducer

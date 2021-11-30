import * as actions from "../actions/actionTypes";

const initialState = {
   layout: {
      drawerOpen: false,
   },
};

const generalLayoutReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.OPEN_NAV_DRAWER:
         return { ...state, layout: { ...state.layout, drawerOpen: true } };
      case actions.CLOSE_NAV_DRAWER:
         return { ...state, layout: { ...state.layout, drawerOpen: false } };
      case actions.TOGGLE_NAV_DRAWER:
         return {
            ...state,
            layout: { ...state.layout, drawerOpen: !state.layout.drawerOpen },
         };
      default:
         return state;
   }
};

export default generalLayoutReducer;

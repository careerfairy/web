import * as actions from "../actions/actionTypes"

const initialState = {
   layout: {
      leftDrawerOpen: true,
   },
}

const groupDashboardReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_GROUP_ADMIN_DRAWER:
         return {
            ...state,
            layout: {
               ...state.layout,
               leftDrawerOpen: payload,
            },
         }
      default:
         return state
   }
}

export default groupDashboardReducer

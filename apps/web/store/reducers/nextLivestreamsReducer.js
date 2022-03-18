import * as actions from "../actions/actionTypes"

const initialState = {
   filterOpen: false,
}

const nextLivestreamsReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.TOGGLE_NEXT_LIVESTREAMS_FILTER:
         return { ...state, filterOpen: !state.filterOpen }
      case actions.OPEN_NEXT_LIVESTREAMS_FILTER:
         return { ...state, filterOpen: true }
      case actions.CLOSE_NEXT_LIVESTREAMS_FILTER:
         return { ...state, filterOpen: false }
      default:
         return state
   }
}

export default nextLivestreamsReducer

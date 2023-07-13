import { Reducer } from "redux"
import * as actions from "../actions/actionTypes"

interface NextLivestreamsReducer {
   filterOpen: boolean
}

const initialState: NextLivestreamsReducer = {
   filterOpen: false,
}

const nextLivestreamsReducer: Reducer<NextLivestreamsReducer> = (
   state = initialState,
   { type, payload }
) => {
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

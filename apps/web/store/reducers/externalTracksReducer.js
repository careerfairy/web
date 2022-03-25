import * as actions from "../actions/actionTypes"

const initialState = null

const externalTracksReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_EXTERNAL_TRACKS:
         return payload

      case actions.REMOVE_EXTERNAL_TRACKS:
         return null

      default:
         return state
   }
}

export default externalTracksReducer

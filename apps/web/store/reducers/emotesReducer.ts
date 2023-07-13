import { EmoteMessage } from "context/agora/RTMContext"
import * as actions from "../actions/actionTypes"
import { Reducer } from "redux"

const initialState = {
   error: null,
   loading: false,
   emotesData: [],
}

interface EmotesReducer {
   error: null | string
   loading: boolean
   emotesData: EmoteMessage[]
}

const emotesReducer: Reducer<EmotesReducer> = (
   state = initialState,
   { type, payload }
) => {
   switch (type) {
      case actions.CLEAR_ALL_EMOTES:
         return { ...state, emotesData: [] }
      case actions.SEND_EMOTE_START:
         return { ...state, loading: true }
      case actions.ADD_EMOTE:
         if (state.emotesData.length > 40) {
            return {
               ...state,
               emotesData: [payload, ...state.emotesData.slice(-20)],
            }
         }
         return { ...state, emotesData: [payload, ...state.emotesData] }
      case actions.SEND_EMOTE_FAIL:
         return { ...state, loading: false, error: payload }
      case actions.SEND_EMOTE_SUCCESS:
         return { ...state, loading: false, error: null }
      default:
         return state
   }
}

export default emotesReducer

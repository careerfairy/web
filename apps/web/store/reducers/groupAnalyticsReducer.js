import * as actions from "../actions/actionTypes"

const initialState = {
   streams: {
      fromTimeframeAndFuture: [],
   },
   hiddenStreamIds: null,
   visibleStreamIds: [],
}

const groupAnalyticsReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_STREAMS_FROM_TIMEFRAME_AND_FUTURE:
         return {
            ...state,
            streams: { ...state.streams, fromTimeframeAndFuture: payload },
         }
      case actions.CLEAR_STREAMS_FROM_TIMEFRAME_AND_FUTURE:
         return {
            ...state,
            streams: { ...state.streams, fromTimeframeAndFuture: [] },
         }
      case actions.CLEAR_HIDDEN_STREAM_IDS:
         return { ...state, hiddenStreamIds: null }
      case actions.SET_VISIBLE_STREAM_IDS:
         return {
            ...state,
            hiddenStreamIds: payload.hiddenStreamIds,
            visibleStreamIds: payload.visibleStreamIds,
         }
      default:
         return state
   }
}

export default groupAnalyticsReducer

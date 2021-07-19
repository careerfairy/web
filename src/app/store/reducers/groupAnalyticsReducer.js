import * as actions from "../actions/actionTypes";

const initialState = {
   streams: {
      fromTimeframeAndFuture: [],
   },
};

const groupAnalyticsReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_STREAMS_FROM_TIMEFRAME_AND_FUTURE:
         return {
            ...state,
            streams: { ...state.streams, fromTimeframeAndFuture: payload },
         };
      case actions.CLEAR_STREAMS_FROM_TIMEFRAME_AND_FUTURE:
         return { ...state, streams: { ...state.streams, fromTimeframeAndFuture: [] } };
      default:
         return state;
   }
};

export default groupAnalyticsReducer;

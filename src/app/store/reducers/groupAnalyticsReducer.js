import * as actions from "../actions/actionTypes";

const initialState = {
   streams: {
      fromBeforeTimeframe: [],
      fromTimeframe: [],
      fromTimeframeAndFuture: [],
      fromFuture: []
   },
};

const groupAnalyticsReducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case actions.SET_ALL_STREAMS_ANALYTICS_STORE:
         return {
            ...state,
            streams: { ...state.streams, ...payload },
         };
      case actions.CLEAR_STREAMS_IN_ANALYTICS_STORE:
         return {
            ...state,
            streams: { ...state.streams, ...initialState.streams },
         };
      case actions.SET_STREAMS_FROM_TIMEFRAME:
         return {
            ...state,
            streams: { ...state.streams, fromTimeframe: payload },
         };
      case actions.CLEAR_STREAMS_FROM_TIMEFRAME:
         return { ...state, streams: { ...state.streams, fromTimeframe: [] } };
      default:
         return state;
   }
};

export default groupAnalyticsReducer;

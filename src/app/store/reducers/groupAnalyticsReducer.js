import * as actions from "../actions/actionTypes";

const initialState = {
   streams: {
      fromTimeframe: [],
   },
};

const groupAnalyticsReducer = (state = initialState, { type, payload }) => {
   switch (type) {
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

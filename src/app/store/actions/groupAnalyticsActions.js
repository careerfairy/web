import * as actions from './actionTypes';


// Sets a new array to replace the previous filtered streams
export const setStreamsFromTimeframeAndFuture = (streams) => async (dispatch) => {
    dispatch({type: actions.SET_STREAMS_FROM_TIMEFRAME_AND_FUTURE, payload: streams})
};

// Rests the filtered streams in the analytics
export const clearStreamsFromTimeframeAndFuture = () => async (dispatch) => {
    dispatch({type: actions.CLEAR_STREAMS_FROM_TIMEFRAME_AND_FUTURE})
};
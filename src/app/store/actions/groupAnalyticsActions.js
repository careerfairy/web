import * as actions from './actionTypes';


// Sets a new array to replace the previous filtered streams
export const setStreamsFromTimeframeAndFuture = (streams) => async (dispatch) => {
    dispatch({type: actions.SET_STREAMS_FROM_TIMEFRAME_AND_FUTURE, payload: streams})
};

// Rests the filtered streams in the analytics
export const clearStreamsFromTimeframeAndFuture = () => async (dispatch) => {
    dispatch({type: actions.CLEAR_STREAMS_FROM_TIMEFRAME_AND_FUTURE})
};


export const clearHiddenStreamIds  = () => async (dispatch) => {
    dispatch({type: actions.CLEAR_HIDDEN_STREAM_IDS})
};
export const selectVisibleStreams  = (arrayOfNewVisibleStreamIds) => async (dispatch, getState) => {
    const newHiddenStreamIds = {};
    const state = getState()
    const nonFilteredStreamsFromTimeFrameAndFuture = state.analyticsReducer.streams.fromTimeframeAndFuture
    nonFilteredStreamsFromTimeFrameAndFuture.forEach((stream) => {
        if (!arrayOfNewVisibleStreamIds.includes(stream.id)) {
            newHiddenStreamIds[stream.id] = true;
        }
    });
    dispatch({type: actions.SET_VISIBLE_STREAM_IDS, payload: newHiddenStreamIds})
};
import * as actions from './actionTypes';
import { SET_STREAMS_FROM_TIMEFRAME } from "./actionTypes";


// Sets a new array to replace the previous filtered streams
export const setStreamsFromTimeframe = (streams) => async (dispatch) => {
    dispatch({type: actions.SET_STREAMS_FROM_TIMEFRAME, payload: streams})
};

// Rests the filtered streams in the analytics
export const clearStreamsFromTimeframe = () => async (dispatch) => {
    dispatch({type: actions.CLEAR_STREAMS_FROM_TIMEFRAME})
};
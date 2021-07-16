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

export const clearStreamsInAnalyticsStore = () => async (dispatch) => {
    dispatch({type: actions.CLEAR_STREAMS_IN_ANALYTICS_STORE})
}
export const setStreamsInAnalyticsStore = (livestreams, timeframe) => async (dispatch) =>{

    const getCounts = (stream) => {
        return {
            ...stream,
            noOfParticipating: stream?.participatingStudents?.length || 0,
            noOfRegistered: stream?.registeredUsers?.length || 0,
            noOfTalentPool: stream?.talentPool?.length || 0,
        };
    };

    const now = new Date()

    const newStreams = {
        fromBeforeTimeframe: [],
        fromTimeframe: [],
        fromTimeframeAndFuture: [],
        fromFuture: []
    }
    const targetTime = new Date(timeframe);

    livestreams.forEach(stream => {
        stream = getCounts(stream)
        const streamStart = stream.start?.toDate();
        if(streamStart > targetTime && streamStart < now){
            newStreams.fromTimeframe.push(stream)
        }
        if(streamStart < targetTime){
            newStreams.fromBeforeTimeframe.push(stream)
        }
        if(streamStart > now){
            newStreams.fromFuture.push(stream)
        }
    })
    newStreams.fromTimeframeAndFuture = [...newStreams.fromTimeframe, ...newStreams.fromFuture]
    dispatch({type: actions.SET_ALL_STREAMS_ANALYTICS_STORE, payload: newStreams})

};
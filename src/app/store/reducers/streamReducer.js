import * as actions from '../actions/actionTypes';

const initialState = {
    layout: {
        streamerBreakoutRoomModalOpen: false,
    },
    stats: {
        numberOfViewers: 0
    }
};

const streamReducer = (state = initialState, {type, payload}) => {
    switch (type) {
        case actions.OPEN_STREAMER_BREAKOUT_MODAL:
            return {...state, layout: {...state.layout, streamerBreakoutRoomModalOpen: true}}
        case actions.CLOSE_STREAMER_BREAKOUT_MODAL:
            return {...state, layout: {...state.layout, streamerBreakoutRoomModalOpen: false}};
        case actions.SET_NUMBER_OF_VIEWERS:
            return {...state, stats: {...state.stats, numberOfViewers: payload}};
        default:
            return state;
    }
};

export default streamReducer
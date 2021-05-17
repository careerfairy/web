import * as actions from '../actions/actionTypes';

const initialState = {
    layout: {
        streamerBreakoutRoomModalOpen: false,
    }
};

const streamReducer = (state = initialState, {type, payload}) => {
    switch (type) {
        case actions.OPEN_STREAMER_BREAKOUT_MODAL:
            return {...state, layout: {...state.layout, streamerBreakoutRoomModalOpen: true}}
        case actions.CLOSE_STREAMER_BREAKOUT_MODAL:
            return {...state,  layout: {...state.layout, streamerBreakoutRoomModalOpen: false}};
        default:
            return state;
    }
};

export default streamReducer
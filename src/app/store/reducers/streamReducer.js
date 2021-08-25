import * as actions from '../actions/actionTypes';

const initialState = {
    layout: {
        streamerBreakoutRoomModalOpen: false,
        viewerBreakoutRoomModalOpen: false,
        viewerCtaModalOpen: false
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
        case actions.OPEN_VIEWER_BREAKOUT_MODAL:
            return {...state, layout: {...state.layout, viewerBreakoutRoomModalOpen: true}}
        case actions.CLOSE_VIEWER_BREAKOUT_MODAL:
            return {...state, layout: {...state.layout, viewerBreakoutRoomModalOpen: false}};
        case actions.OPEN_VIEWER_CTA_MODAL:
            return {...state, layout: {...state.layout, viewerCtaModalOpen: true}}
        case actions.CLOSE_VIEWER_CTA_MODAL:
            return {...state, layout: {...state.layout, viewerCtaModalOpen: false}};
        case actions.SET_NUMBER_OF_VIEWERS:
            return {...state, stats: {...state.stats, numberOfViewers: payload}};
        default:
            return state;
    }
};

export default streamReducer
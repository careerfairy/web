import * as actions from '../actions/actionTypes';

const initialState = null;

const rtmChannelReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case actions.SET_RTM_CHANNEL:
            return payload;

        case actions.REMOVE_RTM_CHANNEL:
            return null

        default:
            return state;
    }
};

export default rtmChannelReducer
import * as actions from '../actions/actionTypes';

const initialState = null;

const rtcClientReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case actions.SET_RTC_CLIENT:
            return payload;

        case actions.REMOVE_RTC_CLIENT:
            return null

        default:
            return state;
    }
};

export default rtcClientReducer
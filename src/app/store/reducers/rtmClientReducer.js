import * as actions from '../actions/actionTypes';

const initialState = null;

const rtmClientReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case actions.SET_RTM_CLIENT:
            return payload;

        case actions.REMOVE_RTM_CLIENT:
            return null

        default:
            return state;
    }
};

export default rtmClientReducer
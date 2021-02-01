import * as actions from '../actions/actionTypes';

const initialState = {

};

const rtmChannelReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case actions.SET_RTM_CHANNEL:
            return payload;

        case actions.REMOVE_RTM_CHANNEL:
            return {
                ...state,
                deleteTodo: { ...state.deleteTodo, loading: false, error: payload },
            };

        default:
            return state;
    }
};

export default rtmChannelReducer
import * as actions from '../actions/actionTypes';

const initialState = {
    error: null,
    loading: false,
    emotesData: []
};

const emotesReducer = (state = initialState, {type, payload}) => {
    switch (type) {
        case actions.SEND_EMOTE_START:
            return {...state, loading: true};
        case actions.ADD_EMOTE:
            debugger
            return {...state, emotes: [...state.emotesData, payload]};
        case actions.SEND_EMOTE_FAIL:
            return {...state, loading: false, error: payload};
        case actions.SEND_EMOTE_SUCCESS:
            return {...state, loading: false, error: null};
        default:
            return state;
    }
};

export default emotesReducer
import * as actions from '../actions/actionTypes';

const initialState = {
    error: null,
    emotesData:[]
};

const emotesReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case actions.ADD_EMOTE:
            return { ...state, emotes: [...state.emotesData, payload] };

        case actions.ADD_EMOTE_FAIL:
            return { ...state, error: payload };

        case actions.RECEIVE_EMOTE_FAIL:
            return {  ...state, error: payload };

        default:
            return state;
    }
};

export default emotesReducer
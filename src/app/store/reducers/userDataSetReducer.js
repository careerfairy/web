import * as actions from '../actions/actionTypes';

const initialState = {
    ordered: undefined,
    mapped: undefined
};

const userDataSetReducer = (state = initialState, {type, payload}) => {
    switch (type) {
        case actions.SET_MAP_USER_DATA_SET:
            return {...state, mapped: payload};

        case actions.SET_ORDERED_USER_DATA_SET:
            return {...state, ordered: payload}

        case actions.REMOVE_MAP_USER_DATA_SET:
            return {...state, mapped: undefined}

        case actions.REMOVE_ORDERED_USER_DATA_SET:
            return {...state, ordered: undefined}

        default:
            return state;
    }
};

export default userDataSetReducer
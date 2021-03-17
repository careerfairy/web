import * as actions from './actionTypes';

// Set the object of userData Sets
export const setMapUserDataSet = (mapUserDataSet) => async (dispatch) => {
    dispatch({
        type: actions.SET_MAP_USER_DATA_SET,
        payload: Object.keys(mapUserDataSet)?.length ? mapUserDataSet: null
    });
};

// Set the array of userData Sets
export const setOrderedUserDataSet = (orderedUserDataSet) => async (dispatch) => {
    dispatch({
        type: actions.SET_ORDERED_USER_DATA_SET,
        payload: orderedUserDataSet?.length ? orderedUserDataSet: null
    });
};

// Clear the array of userData Sets
export const removeOrderedUserDataSet = () => async (
    dispatch,
) => {
    dispatch({type: actions.REMOVE_ORDERED_USER_DATA_SET});
};

// Clear the Object of userData Sets
export const removeMappedUserDataSet = () => async (
    dispatch,
) => {
    dispatch({type: actions.REMOVE_MAP_USER_DATA_SET});
};

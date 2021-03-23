import * as actions from './actionTypes';
import * as actionMethods from './index'

const buildFilterGroup = (id) => {
    return {
        id,
        label: "",
        filters: [],
        filteredStudents: [],
        saved: false
    }
}

// Create a new filter group and store it in redux as current filter group
export const createFilterGroup = () => async (dispatch, getState, {getFirestore}) => {
    try {
        dispatch({type: actions.LOADING_FILTER_GROUP_START})
        const firestore = getFirestore();
        const filterGroupDocRef = firestore
            .collection('filterGroups')
            .doc()
        const filterGroupId = filterGroupDocRef.id
        const newFilterGroup = buildFilterGroup(filterGroupId)
        await firestore
            .collection("filterGroups")
            .doc(filterGroupId)
            .set(newFilterGroup)

        dispatch({
            type: actions.SET_CURRENT_FILTER_GROUP,
            payload: newFilterGroup
        });

    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
};

// Delete the currently active filter group
export const deleteFilterGroup = (filterGroupId = "") => async (dispatch, getState, {getFirestore}) => {
    dispatch({type: actions.LOADING_FILTER_GROUP_START})
    try {
        const firestore = getFirestore();
        const filterGroupRef = firestore
            .collection('filterGroups')
            .doc(filterGroupId)
        await firestore.delete(filterGroupRef)

        dispatch({
            type: actions.CLEAR_CURRENT_FILTER_GROUP,
        });

    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
};

// Delete the currently active filter group
export const setFilterOptions = (arrayOfGroupIds = []) => async (dispatch, getState, {getFirestore}) => {
    try {
        const state = getState()
        const oldFilterOptions = state.currentFilterGroup.data?.filters || []
        const newFilterOptions = arrayOfGroupIds.map(groupId => {
            const currentFilter = oldFilterOptions.find(filter => filter.groupId === groupId)
            return currentFilter || {
                groupId,
                filterOptions: []
            }
        })
        dispatch({
            type: actions.SET_FILTER_OPTIONS,
            payload: newFilterOptions
        })
    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
};

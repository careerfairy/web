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

// Set the filterGroups of a query
export const setFilters = (arrayOfGroupIds = []) => async (dispatch, getState) => {
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
            type: actions.SET_FILTERS,
            payload: newFilterOptions
        })
    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
};

// Set the category options of a filter
export const setFilterOptions = (arrayOfCategoryIds = [], groupId) => async (dispatch, getState) => {
    try {
        const state = getState()
        const newFilterOptions = state.currentFilterGroup.data?.filters.map(filter => {
            if (filter.groupId === groupId) {
                filter.filterOptions = arrayOfCategoryIds.map(categoryId => {
                    const oldCategories = filter.filterOptions || []
                    const currentCategory = oldCategories.find(category => category.categoryId === categoryId)
                    return currentCategory || {
                        categoryId,
                        targetOptions: []
                    }
                })
            }
            return filter
        })
        dispatch({
            type: actions.SET_FILTERS,
            payload: newFilterOptions
        })
    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
};

// Set the category options of a filter
export const setFilterOptionTargetOptions = (arrayOfOptionIds = [], categoryId, groupId) => async (dispatch, getState) => {
    try {
        const state = getState()
        const newFilterOptions = state.currentFilterGroup.data?.filters.map(filter => {
            if (filter.groupId === groupId) {
                filter.filterOptions = filter.filterOptions.map(categoryFilter => {
                    if (categoryFilter.categoryId === categoryId) {
                        categoryFilter.targetOptionIds = arrayOfOptionIds
                    }
                    return categoryFilter
                })
            }
            return filter
        })
        dispatch({
            type: actions.SET_FILTERS,
            payload: newFilterOptions
        })
    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
};

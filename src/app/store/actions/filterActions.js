import * as actions from './actionTypes';
import * as actionMethods from './index'
import {convertArrayOfObjectsToDictionaryByProp} from "../../data/util/AnalyticsUtil";


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

export const setCurrentFilterGroupLoading = () => async (dispatch) => {
    dispatch({type: actions.LOADING_FILTER_GROUP_START})
}
export const setCurrentFilterGroupLoaded = () => async (dispatch) => {
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
}

// Filter Group followers by Categories
export const filterAndSetGroupFollowers = (groupId) => async (dispatch, getState) => {
    const state = getState()
    const {filterOptions} = state.currentFilterGroup.data.filters.find(filter => filter.groupId === groupId) || {}
    const groupCategories = state.firestore.data.careerCenterData?.[groupId]?.categories
    const groupFollowers = state.firestore.ordered[`followers of ${groupId}`]

    const handleSetNewTotalFilteredStudents = () => {
        const groupFilters = state.currentFilterGroup.data.filters || []
        const newTotalFilteredStudentsMap = groupFilters.reduce((acc, curr) => {
            return curr.filteredGroupFollowerData?.data ? Object.assign(acc, curr.filteredGroupFollowerData?.data) : acc
        }, {})
        dispatch(setTotalFilterGroupUsers(newTotalFilteredStudentsMap, true))
    }
    if (filterOptions && groupCategories?.length && groupFollowers?.length) {
        const noCategorySelected = filterOptions?.length === 0
        let filteredFollowers;
        let filteredFollowerMap;
        if (noCategorySelected) {
            filteredFollowers = groupFollowers
            filteredFollowerMap = state.firestore.data[`followers of ${groupId}`]
        } else {
            filteredFollowers = groupFollowers.filter(user => checkIfUserMatches(user, filterOptions, groupId))
            filteredFollowerMap = convertArrayOfObjectsToDictionaryByProp(filteredFollowers, "id")
        }
        const oldFilterOptions = state.currentFilterGroup.data?.filters || []
        const newFilterOptions = oldFilterOptions.map(filterOption => {
            if (filterOption.groupId === groupId) {
                filterOption.filteredGroupFollowerData = {
                    ordered: filteredFollowers,
                    data: filteredFollowerMap,
                    count: filteredFollowers.length
                }
            }
            return filterOption
        })
        handleSetNewTotalFilteredStudents()
        dispatch({
            type: actions.SET_FILTERS,
            payload: newFilterOptions
        })
    }

}

// Add group Followers to Total

export const addGroupFollowersToTotal = (groupId) => async (dispatch, getState) => {
    const state = getState()
    const totalFollowers = state.currentFilterGroup.totalStudentsData.data
    if (totalFollowers) {
        const groupFollowers = state.firestore.data[`followers of ${groupId}`] || {}
        const newTotalFollowers = Object.assign(totalFollowers, groupFollowers)
        dispatch(setTotalFilterGroupUsers(newTotalFollowers))
    }

}
// Set Total users
export const setTotalFilterGroupUsers = (studentsMap = {}, isFiltered) => async (dispatch) => {
    const studentsArray = Object.keys(studentsMap).map(key => ({...studentsMap[key]}))
    dispatch({
        type: isFiltered ? actions.SET_FILTERED_FILTER_GROUP_USERS : actions.SET_TOTAL_FILTER_GROUP_USERS,
        payload: {
            ordered: studentsArray,
            data: studentsMap,
            count: studentsArray.length
        }
    })
}

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
                        targetOptionIds: []
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

const buildFilterGroup = (id) => {
    return {
        data: {
            id,
            label: "",
            filters: [],
            filteredStudents: [],
        },
        saved: true
    }
}

const checkIfUserMatches = (user, filterCategories = [], targetGroupId) => {
    const {categories: userCategories} = user.registeredGroups.find(({groupId}) => groupId === targetGroupId) || {}
    if (userCategories) {
        return filterCategories.every(filterCategory => {
            const noOptionsSelected = filterCategory.targetOptionIds?.length === 0
            return noOptionsSelected || userCategories.some(({id, selectedValueId}) =>
                id === filterCategory.categoryId
                && filterCategory.targetOptionIds?.includes(selectedValueId
                ));
        })
    }
    return false
}

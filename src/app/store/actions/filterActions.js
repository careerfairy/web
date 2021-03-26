import * as actions from './actionTypes';
import * as actionMethods from './index'
import {convertArrayOfObjectsToDictionaryByProp} from "../../data/util/AnalyticsUtil";
import {useSelector} from "react-redux";


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
        console.log("-> newFilterGroup", newFilterGroup);
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


// Save the current filter group
export const saveCurrentFilterGroup = () => async (dispatch, getState, {getFirestore}) => {
    try {
        dispatch({type: actions.LOADING_FILTER_GROUP_START})
        const firestore = getFirestore();
        const state = getState()
        const currentFilterGroup = state.currentFilterGroup
        let targetId = currentFilterGroup.data.id
        if (!targetId) {
            const filterGroupDocRef = firestore
                .collection('filterGroups')
                .doc()

            targetId = filterGroupDocRef.id
        }
        await firestore
            .collection("filterGroups")
            .doc(targetId)
            .set(cleanFilterGroup(currentFilterGroup))

        dispatch({
            type: actions.SET_CURRENT_FILTER_GROUP,
            payload: currentFilterGroup
        });
        dispatch(actionMethods.enqueueSnackbar({
            message: "Query has successfully been saved",
            options: {
                variant: "success",
                preventDefault: true,
            }
        }))
    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
};

// Delete the currently active filter group
export const deleteFilterGroup = (filterGroupId = "") => async (dispatch, getState, {getFirestore}) => {
    const isCurrentFilterGroup = !filterGroupId
    const state = getState()
    const targetId = isCurrentFilterGroup ? state.currentFilterGroup.data.id : filterGroupId
    dispatch({type: actions.LOADING_FILTER_GROUP_START})
    try {
        const firestore = getFirestore();
        const filterGroupRef = firestore
            .collection('filterGroups')
            .doc(targetId)
        await filterGroupRef.delete()

        if (isCurrentFilterGroup) {
            dispatch({
                type: actions.CLEAR_CURRENT_FILTER_GROUP,
            });
        }

    } catch (e) {
        dispatch(actionMethods.sendGeneralError(e))
    }
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
};

// Set a filter group as current
export const setFilterGroupAsCurrentWithId = (filterGroupId) => async (dispatch, getState) => {
    const state = getState()
    const targetFilterGroup = state.firestore.data.filterGroups?.[filterGroupId]
    if (targetFilterGroup) {
        dispatch({
            type: actions.SET_CURRENT_FILTER_GROUP,
            payload: targetFilterGroup
        })
    }
}


export const setCurrentFilterGroupLoading = () => async (dispatch) => {
    dispatch({type: actions.LOADING_FILTER_GROUP_START})
}
export const setCurrentFilterGroupLoaded = () => async (dispatch) => {
    dispatch({type: actions.LOADING_FILTER_GROUP_END})
}
export const setCurrentFilterGroupFiltered = () => async (dispatch) => {
    dispatch({type: actions.SET_CURRENT_FILTER_GROUP_FILTERED})
}
export const setCurrentFilterGroupNotFiltered = () => async (dispatch) => {
    dispatch({type: actions.SET_CURRENT_FILTER_GROUP_NOT_FILTERED})
}
export const clearCurrentFilterGroupFilteredData = () => async (dispatch) => {
    dispatch({
        type: actions.CLEAR_CURRENT_FILTER_GROUP_FILTERED_DATA,
        payload: initialTotalData
    })
}

export const handleSetNewTotalFilteredStudents = () => async (dispatch, getState) => {
    const state = getState()
    const groupFilters = state.currentFilterGroup.data.filters || []
    const newTotalFilteredStudentsMap = groupFilters.reduce((acc, curr) => {
        return curr.filteredGroupFollowerData?.data ? Object.assign(acc, curr.filteredGroupFollowerData?.data) : acc
    }, {})
    dispatch(setTotalFilterGroupUsers(newTotalFilteredStudentsMap, true))
}

export const handleCalculateAndSetNewTotalStudents = () => async (dispatch, getState) => {
    const state = getState()
    const groupFilters = state.currentFilterGroup.data.filters || []
    const data = state.firestore.data
    const groupDataKeys = groupFilters.map(({groupId}) => `followers of ${groupId}`)
    const newTotalStudentsMap = groupDataKeys.reduce((acc, curr) => {
        return data[curr] ? Object.assign(acc, data[curr]) : acc
    }, {})
    dispatch(setTotalFilterGroupUsers(newTotalStudentsMap))
}
// Filter Group followers by Categories
export const filterAndSetGroupFollowers = (groupId) => async (dispatch, getState) => {
    const state = getState()
    const {filterOptions} = state.currentFilterGroup.data.filters.find(filter => filter.groupId === groupId) || {}
    const groupCategories = state.firestore.data.careerCenterData?.[groupId]?.categories
    const groupFollowers = state.firestore.ordered[`followers of ${groupId}`]


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
        dispatch(handleSetNewTotalFilteredStudents())
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
            let currentFilter = oldFilterOptions.find(filter => filter.groupId === groupId)
            if (!currentFilter) {
                let filterOptions = []
                const {categories} = state.firestore.data.careerCenterData?.[groupId] || {}
                if (categories?.length) {
                    filterOptions = categories.map(({id}) => ({categoryId: id, targetOptionIds: []}))
                }
                currentFilter = {
                    groupId,
                    filterOptions
                }
            }
            return currentFilter
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
const initialTotalData = {
    ordered: undefined,
    data: undefined,
    count: undefined
}

const cleanFilterGroup = (filterGroup) => {
    return {
        ...filterGroup,
        data: {
            ...filterGroup.data,
            filters: filterGroup.data.filters.map(filter => ({
                ...filter,
                filteredGroupFollowerData: {
                    count: filter?.filteredGroupFollowerData?.count || 0
                }
            }))
        },
        totalStudentsData: {
            count: filterGroup.totalStudentsData?.count || 0
        },
        filteredStudentsData: {
            count: filterGroup.filteredStudentsData?.count || 0
        },
        loading: false
    }
}
const buildFilterGroup = (id) => {

    return {
        data: {
            id,
            label: "",
            filters: [],
        },
        totalStudentsData: {},
        filteredStudentsData: {},
        saved: false,
        loading: false,
        justFiltered: false
    }
}

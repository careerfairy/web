import * as actions from "./actionTypes";
import AnalyticsUtil from "../../data/util/AnalyticsUtil";

// Set the object of userData Sets

// Set the array of userData Sets
/**
 * @param {function} getUsersByEmail - firebase method of getting users by email
 */
export const setUserDataSet = (getUsersByEmail) => async (
   dispatch, getState
) => {
   const state = getState()
   const nonFilteredStreamsFromTimeFrameAndFuture = state.analyticsReducer.streams.fromTimeframeAndFuture
   const totalIds = AnalyticsUtil.getTotalUniqueIds(
     nonFilteredStreamsFromTimeFrameAndFuture,
   );
   const totalUsers = await getUsersByEmail(totalIds);
   const dictionaryOfUsers = AnalyticsUtil.convertArrayOfUserObjectsToDictionary(
     totalUsers
   );
   dispatch({
      type: actions.SET_USER_DATA_SET,
      payload: {
         mapped: Object.keys(dictionaryOfUsers)?.length ? dictionaryOfUsers : null,
         ordered:totalUsers?.length ? totalUsers : null
      },
   });
};

export const setFilteredUserDataSet = () => async (
   dispatch, getState
) => {
   const state = getState()
   const hiddenStreamIds = state.analyticsReducer.hiddenStreamIds
   const nonFilteredStreamsFromTimeFrameAndFuture = state.analyticsReducer.streams.fromTimeframeAndFuture
   const userDataSetDictionary = state.userDataSet["total"].mapped
   const totalFilteredIds = AnalyticsUtil.getTotalUniqueIds(
     nonFilteredStreamsFromTimeFrameAndFuture,
     hiddenStreamIds
   );
   const totalFilteredUsers = AnalyticsUtil.getUsersFromDictionaryWithIds(totalFilteredIds, userDataSetDictionary)
   const dictionaryOfFilteredUsers = AnalyticsUtil.convertArrayOfUserObjectsToDictionary(
     totalFilteredUsers
   );
   dispatch({
      type: actions.SET_FILTERED_USER_DATA_SET,
      payload: {
         mapped: Object.keys(dictionaryOfFilteredUsers)?.length ? dictionaryOfFilteredUsers : null,
         ordered:totalFilteredUsers?.length ? totalFilteredUsers : null
      },
   });
};

// Clear the array of userData Sets
export const clearUserDataSet = () => async (dispatch) => {
   dispatch({ type: actions.CLEAR_USER_DATA_SET });
};

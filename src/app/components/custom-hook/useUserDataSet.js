import React from 'react';
import {shallowEqual, useSelector} from "react-redux";

/**
 * @param {{miscName: string, displayName: string, id: (*|string), dataSet: string}} currentUserDataSet
 * @param {{isFiltered: boolean}} options
 */
const useUserDataSet = (currentUserDataSet, options= {}) => {
    return useSelector(state => currentUserDataSet.dataSet === "groupUniversityStudents" ?
        state.firestore.ordered[currentUserDataSet.dataSet]
        : state.userDataSet[options.isFiltered? "filtered": "total"].ordered, shallowEqual)
};

export default useUserDataSet;

import React from 'react';
import {shallowEqual, useSelector} from "react-redux";

const useUserDataSet = (currentUserDataSet) => {
    return useSelector(state => currentUserDataSet.dataSet === "groupUniversityStudents" ?
        state.firestore.ordered[currentUserDataSet.dataSet]
        : state.userDataSet.ordered, shallowEqual)
};

export default useUserDataSet;

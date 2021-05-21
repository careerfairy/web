import React from 'react';
import {shallowEqual, useSelector} from "react-redux";

const useUserDataSetDictionary = (currentUserDataSet) => {
    return useSelector(state => currentUserDataSet.dataSet === "groupUniversityStudents" ?
        state.firestore.data[currentUserDataSet.dataSet] : state.userDataSet.mapped, shallowEqual)
};

export default useUserDataSetDictionary;

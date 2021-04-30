import React, {useMemo} from 'react';
import {shallowEqual, useSelector} from "react-redux";
import {populate} from "react-redux-firebase";
const populates = [
    {child: 'groupIds', root: 'careerCenterData', childAlias: "followingGroups"},
]
const useAuthentication = () => {
    const authenticatedUser = useSelector((state) => state.firebase.auth, shallowEqual)
    const userData = useSelector(({firestore}) => firestore.data.userProfile , shallowEqual)
    // const userData = undefined
    // const userData = useMemo(() => userDataInStore, [userDataInStore]);
    return {authenticatedUser, userData};
}

export default useAuthentication;
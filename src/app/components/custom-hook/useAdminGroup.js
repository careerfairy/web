import React, {useMemo} from 'react';
import {populate, useFirestoreConnect} from "react-redux-firebase";
import {CAREER_CENTER_COLLECTION, COMPANY_COLLECTION} from "../util/constants";
import {useAuth} from "../../HOCs/AuthProvider";
import {shallowEqual, useSelector} from "react-redux";
import GroupsUtil from "../../data/util/GroupsUtil";

const populates = [
    {child: 'adminEmails', root: 'userData', childAlias: 'admins'} // replace owner with user object
]


const useAdminGroup = (groupId, isCompany) => {

    const {authenticatedUser} = useAuth()
    const queries = useMemo(() => {
        let queriesArray = []
        const targetId = groupId
        const targetCollection = isCompany ? COMPANY_COLLECTION : CAREER_CENTER_COLLECTION
        if (targetId) {
            queriesArray.push(...[{
                    collection: targetCollection,
                    doc: targetId,
                    storeAs: "group",
                    populates
                },
                    {
                        collection: targetCollection,
                        doc: targetId,
                        subcollections: [{
                            collection: "admins",
                        }],
                        storeAs: "adminRoles",
                    },
                    {
                        collection: `notifications`,
                        where: [["details.receiver", "==", targetId], ["open", "==", true]]
                    }
                ]
            )
            if (authenticatedUser) {
                queriesArray.push({
                    collection: targetCollection,
                    doc: targetId,
                    subcollections: [{
                        collection: "admins",
                        doc: authenticatedUser.email
                    }],
                    storeAs: "userRole",
                })
            }
        }

        return queriesArray
    }, [authenticatedUser?.email])

    useFirestoreConnect(queries)

    return useSelector(({firestore}) => firestore.data.group && {
        ...populate(firestore, "group", populates),
        id: groupId,
        options: GroupsUtil.handleFlattenOptions(firestore.data.group)
    }, shallowEqual)
};

export default useAdminGroup;

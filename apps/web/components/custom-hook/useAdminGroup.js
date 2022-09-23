import React, { useEffect, useMemo } from "react"
import { useFirestoreConnect } from "react-redux-firebase"
import { CAREER_CENTER_COLLECTION } from "../util/constants"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"

const useAdminGroup = (groupId) => {
   const dispatch = useDispatch()

   useEffect(() => {
      return () => {
         dispatch(actions.clearUserDataSet())
      }
   }, [dispatch])

   const queries = useMemo(() => {
      let queriesArray = []
      const targetId = groupId
      const targetCollection = CAREER_CENTER_COLLECTION
      if (targetId) {
         queriesArray.push(
            ...[
               {
                  collection: targetCollection,
                  doc: targetId,
                  storeAs: "group",
               },
               {
                  collection: `notifications`,
                  where: [
                     ["details.receiver", "==", targetId],
                     ["open", "==", true],
                  ],
               },
            ]
         )
      }
      return queriesArray
   }, [groupId])

   useFirestoreConnect(queries)

   return useSelector(
      ({ firestore }) =>
         firestore.data.group && {
            ...firestore.data.group,
            id: groupId,
         },
      shallowEqual
   )
}

export default useAdminGroup

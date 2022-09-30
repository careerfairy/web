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
      if (groupId) {
         queriesArray.push(
            ...[
               {
                  collection: CAREER_CENTER_COLLECTION,
                  doc: groupId,
                  storeAs: "group",
               },
               {
                  collection: `notifications`,
                  where: [
                     ["details.receiver", "==", groupId],
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
            id: firestore.data.group.id || firestore.data.group.groupId, // TODO: run a script after migration to add the id field to all careerCenterData documents
         },
      shallowEqual
   )
}

export default useAdminGroup

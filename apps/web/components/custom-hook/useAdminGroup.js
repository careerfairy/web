import React, { useEffect, useMemo } from "react"
import { useFirestoreConnect } from "react-redux-firebase"
import { CAREER_CENTER_COLLECTION } from "../util/constants"
import { useAuth } from "../../HOCs/AuthProvider"
import { shallowEqual, useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { useRouter } from "next/router"

export const groupAdminPopulates = [
   { child: "adminEmails", root: "userData", childAlias: "admins" }, // replace owner with user object
]

const useAdminGroup = (groupId) => {
   const dispatch = useDispatch()
   const { authenticatedUser } = useAuth()
   const { pathname, query } = useRouter()

   const isValidating = useMemo(() => {
      return Boolean(
         pathname === "/group/[groupId]/admin" && query.dashboardInviteId
      )
   }, [pathname, query.dashboardInviteId])

   useEffect(() => {
      return () => {
         dispatch(actions.clearUserDataSet())
      }
   }, [])

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
                  populates: isValidating ? [] : groupAdminPopulates,
               },
               {
                  collection: targetCollection,
                  doc: targetId,
                  subcollections: [
                     {
                        collection: "admins",
                     },
                  ],
                  storeAs: "adminRoles",
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
         if (authenticatedUser) {
            queriesArray.push({
               collection: targetCollection,
               doc: targetId,
               subcollections: [
                  {
                     collection: "admins",
                     doc: authenticatedUser.email,
                  },
               ],
               storeAs: "userRole",
            })
         }
      }
      return queriesArray
   }, [authenticatedUser?.email, groupId, isValidating])

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

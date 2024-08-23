import { Group } from "@careerfairy/shared-lib/groups"
import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { useMemo } from "react"
import { shallowEqual, useSelector } from "react-redux"
import { useFirestoreConnect } from "react-redux-firebase"
import { CAREER_CENTER_COLLECTION } from "../util/constants"

const useAdminGroup = (
   groupId: string
): { group: Group; stats: GroupStats } => {
   const queries = useMemo(() => {
      const queriesArray = []
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
               {
                  collection: CAREER_CENTER_COLLECTION,
                  doc: groupId,
                  subcollections: [{ collection: "stats", doc: "groupStats" }],
                  storeAs: "groupStats",
               },
            ]
         )
      }
      return queriesArray
   }, [groupId])

   useFirestoreConnect(queries)

   //@ts-ignore
   return useSelector(({ firestore }) => {
      return {
         group: firestore.data.group && {
            ...firestore.data.group,
            id: firestore.data.group.id || firestore.data.group.groupId, // TODO: run a script after migration to add the id field to all careerCenterData documents
         },
         stats: firestore.data.groupStats,
      }
   }, shallowEqual)
}

export default useAdminGroup

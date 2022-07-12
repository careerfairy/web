import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups"
import useCollection from "./useCollection"
import { useCallback } from "react"

const useGroupATSAccounts = (groupId: string, realtime: boolean = true) => {
   // cache query function
   const query = useCallback(
      (firestore) =>
         firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("ats"),
      [groupId]
   )

   return useCollection<GroupATSAccount>(query, realtime)
}

export default useGroupATSAccounts

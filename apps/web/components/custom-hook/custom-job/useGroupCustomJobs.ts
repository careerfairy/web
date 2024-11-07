import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   collection,
   orderBy,
   query,
   QueryConstraint,
   where,
} from "firebase/firestore"
import { DateTime } from "luxon"
import { useMemo } from "react"
import { useFirestore } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

type Options = {
   livestreamId?: string
   sparkId?: string
   includePermanentlyExpired?: boolean
   excludeExpired?: boolean
}

// Create end of day date for comparison using Luxon
const startOfToday = DateTime.now().startOf("day").toJSDate()

/**
 * Retrieves custom jobs associated with a specific group ID
 *
 * @param {string} groupId - The ID of the group to fetch custom jobs for.
 * @param {Options} options - Optional parameters to filter custom jobs by livestream ID or spark ID.
 */
const useGroupCustomJobs = (groupId: string, options: Options = {}) => {
   const {
      livestreamId = "",
      sparkId = "",
      includePermanentlyExpired,
      excludeExpired,
   } = options

   const firestore = useFirestore()

   const collectionRef = useMemo(() => {
      const queryConditions: QueryConstraint[] = [
         where("groupId", "==", groupId),
      ]

      if (livestreamId) {
         queryConditions.push(
            where("livestreams", "array-contains", livestreamId)
         )
      }

      if (sparkId) {
         queryConditions.push(where("sparks", "array-contains", sparkId))
      }

      if (!includePermanentlyExpired) {
         queryConditions.push(where("isPermanentlyExpired", "==", false))
      }

      if (excludeExpired) {
         queryConditions.push(where("deadline", ">", startOfToday))
         queryConditions.push(orderBy("deadline", "desc")) // sort by deadline
      } else {
         queryConditions.push(orderBy("createdAt", "desc")) // sort by createdAt
      }

      return query(collection(firestore, "customJobs"), ...queryConditions)
   }, [
      groupId,
      livestreamId,
      sparkId,
      includePermanentlyExpired,
      excludeExpired,
      firestore,
   ])

   const { data } = useFirestoreCollection<CustomJob>(collectionRef)

   return data
}

export default useGroupCustomJobs

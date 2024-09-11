import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { groupRepo } from "data/RepositoryInstances"
import firebase from "firebase/compat/app"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

/**
 * Retrieves all custom jobs available for a given @param groupId, where the custom jobs deadline has not reached yet
 * and they are linked to at least a content (livestream, spark or future content types).
 * The items retrieved are also ordered by their deadline date in descending order.
 * @param groupId Id of the group for which the custom jobs are part of.
 * @returns Custom jobs for the group, which have linked content and sorted by deadline in descending order.
 */
const useGroupAvailableCustomJobs = (groupId: string) => {
   const jobsQuery = useMemo<firebase.firestore.Query>(() => {
      return groupRepo.groupAvailableCustomJobsQuery(groupId)
   }, [groupId])

   const { data, status } = useFirestoreCollection<CustomJob>(jobsQuery, {
      idField: "id", // this field will be added to the firestore object
      suspense: false,
   })

   if (status === "loading") return []
   return (
      data?.filter((job) => job?.livestreams?.length || job?.sparks?.length) ||
      []
   )
}

export default useGroupAvailableCustomJobs

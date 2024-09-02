import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { groupRepo } from "data/RepositoryInstances"
import firebase from "firebase/compat/app"
import { useMemo } from "react"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

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

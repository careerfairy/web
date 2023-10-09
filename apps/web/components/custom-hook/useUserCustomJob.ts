import { UserCustomJobApplicationDocument } from "@careerfairy/shared-lib/users"
import { useFirestoreDocument } from "./utils/useFirestoreDocument"

const useUserCustomJob = (userId: string, jobId: string) => {
   const { data } = useFirestoreDocument<UserCustomJobApplicationDocument>(
      "userData",
      [userId, "customJobApplications", jobId],
      {
         idField: "id",
      }
   )

   return data
}

export default useUserCustomJob

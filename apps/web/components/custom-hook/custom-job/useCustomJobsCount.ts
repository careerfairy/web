import { collection, query, where } from "firebase/firestore"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import useCountQuery from "../useCountQuery"

type Options = {
   totalItems?: number
   businessFunctionTagIds: string[]
   ignoreIds?: string[]
   disabled?: boolean
   livestreamId?: string
}
const useCustomJobsCount = (options?: Options) => {
   const { businessFunctionTagIds } = options
   const countQuery = query(
      collection(FirestoreInstance, "customJobs"),
      where("deadline", ">", new Date()),
      where("published", "==", true),
      ...(businessFunctionTagIds.length
         ? [
              where(
                 "businessFunctionsTagIds",
                 "array-contains-any",
                 businessFunctionTagIds
              ),
           ]
         : []),
      ...(options?.livestreamId
         ? [where("livestreams", "array-contains", options.livestreamId)]
         : [])
   )

   return useCountQuery(countQuery)
}

export default useCustomJobsCount

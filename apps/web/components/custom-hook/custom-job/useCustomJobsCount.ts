import { collection, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import useSWRCountQuery from "../useSWRCountQuery"

type Options = {
   totalItems?: number
   businessFunctionTagIds: string[]
   ignoreIds?: string[]
   disabled?: boolean
   livestreamId?: string
}

const useCustomJobsCount = (options?: Options) => {
   const { businessFunctionTagIds } = options

   const now = useMemo(() => new Date(), [])

   const countQuery = query(
      collection(FirestoreInstance, "customJobs"),
      where("deadline", ">", now),
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

   return useSWRCountQuery(countQuery, {
      disabled: options?.disabled,
   })
}

export default useCustomJobsCount

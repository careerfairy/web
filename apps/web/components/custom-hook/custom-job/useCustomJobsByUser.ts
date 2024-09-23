import { useAuth } from "HOCs/AuthProvider"
import useCustomJobs from "./useCustomJobs"

/**
 * Fetches the custom jobs according to the specified options. If there is an user then his businessFunctionsTagIds will be used for retrieving
 * the first batch of custom jobs which appear first.
 * @param batchSize Total number of items per batch to be sliced.
 **/
const useCustomJobsByUser = (disabled?: boolean) => {
   const { userData } = useAuth()

   const businessFunctions = userData?.businessFunctionsTagIds || []

   // 1. Fetch all customJobs for tags if tags with limit
   const { customJobs: businessFunctionCustomJobs } = useCustomJobs({
      businessFunctionTagIds: businessFunctions,
      disabled: disabled,
   })

   // 2. Fetch other jobs ignoring already fetched also with limit
   const { customJobs: otherCustomJobs } = useCustomJobs({
      businessFunctionTagIds: [],
      ignoreIds: businessFunctionCustomJobs?.map((job) => job.id),
      disabled: disabled,
   })

   // 3. Concat jobs and slice according to limit
   const allCustomJobs = (businessFunctionCustomJobs || []).concat(
      otherCustomJobs || []
   )

   return {
      customJobs: allCustomJobs,
      totalCount: allCustomJobs.length,
   }
}

export default useCustomJobsByUser

import { useAuth } from "HOCs/AuthProvider"
import useCustomJobs from "./useCustomJobs"

/**
 * Fetches the custom jobs according to the specified options. If there is an user then his businessFunctionsTagIds will be used for retrieving
 * the first batch of custom jobs which appear first.
 * @param batchSize Total number of items per batch to be sliced.
 **/
const useCustomJobsByUser = (batchSize: number, disabled?: boolean) => {
   const { userData } = useAuth()

   const businessFunctions = userData?.businessFunctionsTagIds || []

   // 1. Fetch all customJobs for tags if tags with limit

   const { customJobs: businessFunctionCustomJobs } = useCustomJobs({
      totalItems: batchSize,
      businessFunctionTagIds: businessFunctions,
      disabled: disabled,
   })
   // 2. Fetch other jobs ignoring already fetched also with limit

   const { customJobs: otherCustomJobs } = useCustomJobs({
      totalItems: batchSize,
      businessFunctionTagIds: [],
      ignoreIds: businessFunctionCustomJobs.map((job) => job.id),
      disabled: disabled,
   })

   // 3. Concat jobs and slice according to limit
   const allCustomJobs = businessFunctionCustomJobs.concat(otherCustomJobs)

   const customJobs = allCustomJobs.slice(0, batchSize)

   return {
      customJobs: customJobs,
      totalCount: allCustomJobs.length,
   }
}

export default useCustomJobsByUser

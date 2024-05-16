import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { UserData } from "@careerfairy/shared-lib/users"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

/**
 * Fetches the user's latest custom job applications via cloud function.
 * The expected results is to be sorted with the latest application first.
 * @param limit Limit of data items.
 * @returns CustomJobApplicant[] with the most recent applications according to @param limit.
 */
const useUserCustomJobApplications = (
   userData: UserData,
   limit: number = 10
) => {
   const fetcher = useFunctionsSWR()

   const key = userData
      ? [
           "getUserCustomJobApplications",
           {
              limit: limit,
           },
        ]
      : null

   const {
      data: jobApplications,
      error,
      isLoading,
   } = useSWR<CustomJobApplicant[]>(key, fetcher, {
      onError: (error, key) =>
         errorLogAndNotify(error, {
            message: "Error Fetching user custom job applications via function",
            key,
         }),
      ...reducedRemoteCallsOptions,
      suspense: false,
   })

   return useMemo(
      () => ({
         jobApplications: jobApplications,
         loading: isLoading,
         error: error,
      }),
      [error, isLoading, jobApplications]
   )
}

export default useUserCustomJobApplications

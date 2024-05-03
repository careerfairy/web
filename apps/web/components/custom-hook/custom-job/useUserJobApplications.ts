import { UserJobApplicationDocument } from "@careerfairy/shared-lib/users"
import { useMemo } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const useUserCustomJobApplications = (limit?: 10) => {
   const fetcher = useFunctionsSWR()

   const {
      data: jobApplications,
      error,
      isLoading,
   } = useSWR<UserJobApplicationDocument[]>(
      [
         "getUserJobApplications",
         {
            limit: limit,
         },
      ],
      fetcher,
      {
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message:
                  "Error Fetching user job applications by IDs via function",
               key,
            }),
         ...reducedRemoteCallsOptions,
         suspense: false,
      }
   )

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

import useSWR from "swr"
import { useMemo } from "react"
import {
   ATSPaginatedResults,
   RecruitersFunctionCallOptions,
} from "@careerfairy/shared-lib/dist/ats/Functions"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"
import { Recruiter } from "@careerfairy/shared-lib/dist/ats/Recruiter"

const useGroupATSRecruiters = (
   groupId: string,
   integrationId: string,
   options?: RecruitersFunctionCallOptions
): ATSPaginatedResults<Recruiter> => {
   const fetcher = useFunctionsSWRFetcher<ATSPaginatedResults<Recruiter>>()

   const { data } = useSWR(
      [
         "fetchATSRecruiters_eu",
         {
            groupId,
            integrationId,
            ...options,
         },
      ],
      fetcher,
      reducedRemoteCallsOptions
   )

   return useMemo(() => {
      // map to business model (convert plain object to class object)
      const recruiters = data.results.map(Recruiter.createFromPlainObject)

      return {
         ...data,
         results: recruiters,
      }
   }, [data])
}

export default useGroupATSRecruiters

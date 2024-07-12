import {
   ATSPaginatedResults,
   RecruitersFunctionCallOptions,
} from "@careerfairy/shared-lib/ats/Functions"
import { Recruiter } from "@careerfairy/shared-lib/ats/Recruiter"
import { useMemo } from "react"
import useSWR from "swr"
import useFunctionsSWRFetcher, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

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

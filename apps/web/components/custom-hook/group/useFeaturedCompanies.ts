import { useAuth } from "HOCs/AuthProvider"

import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { useMemo } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import useFunctionsSWR, {
   reducedRemoteCallsOptions,
} from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching featured companies: ${key}`,
      }),
}

const useFeaturedCompanies = (suspense = true) => {
   const { userData } = useAuth()
   const fetcher = useFunctionsSWR<GroupPresenter[]>()
   const options = useMemo(() => {
      return {
         countryId: userData?.universityCountryCode,
         fieldOfStudyId: userData?.fieldOfStudy?.id,
      }
   }, [userData?.universityCountryCode, userData?.fieldOfStudy?.id])

   return useSWR<GroupPresenter[]>(["getFeaturedCompanies", options], fetcher, {
      ...swrOptions,
      suspense,
   })
}

export default useFeaturedCompanies

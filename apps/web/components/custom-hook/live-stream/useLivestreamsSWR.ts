import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useCallback, useMemo } from "react"

import { livestreamService } from "data/firebase/LivestreamService"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export type UseLivestreamsSWROptions = {
   languageCodes?: string[]
   companyIndustries?: string[]
   companyCountries?: string[]
   targetFieldsOfStudy?: FieldOfStudy[]
   withRecordings?: boolean
   withTest?: boolean
   withHidden?: boolean
   limit?: number
   targetGroupId?: string
   type: "pastEvents" | "upcomingEvents"
   disabled?: boolean
}

const useLivestreamsSWR = (
   options: UseLivestreamsSWROptions = {
      type: "upcomingEvents",
   }
) => {
   const key = useMemo(
      () => (options.disabled ? null : JSON.stringify(options)),
      [options]
   )

   const swrFetcher = useCallback(
      () => livestreamService.fetchLivestreams(options),
      [options]
   )

   return useSWR(key, swrFetcher, swrOptions)
}

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestreams with options: ${key}`,
      }),
}

export default useLivestreamsSWR

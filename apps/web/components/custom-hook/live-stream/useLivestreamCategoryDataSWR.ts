import {
   CategoryDataOption,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import FirebaseService from "data/firebase/FirebaseService"
import { livestreamService } from "data/firebase/LivestreamService"
import { useMemo, useCallback } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export type useLivestreamCategoryDataOptions = {
   livestream?: LivestreamEvent
   userData?: UserData
}
const useLivestreamCategoryDataSWR = (
   firebase: FirebaseService,
   options: useLivestreamCategoryDataOptions
) => {
   const key = useMemo(
      () => (options ? JSON.stringify(options) : null),
      [options]
   )

   const swrFetcher = useCallback(
      () =>
         livestreamService.checkCategoryData(
            firebase,
            options as CategoryDataOption
         ),
      [options, firebase]
   )

   return useSWR(key, swrFetcher, swrOptions)
}
const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestream category data with options: ${key}`,
      }),
}
export default useLivestreamCategoryDataSWR

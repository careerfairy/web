import { CategoryDataOption } from "@careerfairy/shared-lib/livestreams"
import FirebaseService from "data/firebase/FirebaseService"
import { livestreamService } from "data/firebase/LivestreamService"
import { useMemo } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestream category data with options: ${key}`,
      }),
}

const useLivestreamCategoryDataSWR = (
   firebase: FirebaseService,
   options: CategoryDataOption
) => {
   const key = useMemo(
      () => (options ? JSON.stringify(options) : null),
      [options]
   )

   const swrFetcher = async () => {
      return livestreamService.checkCategoryData(
         firebase,
         options as CategoryDataOption
      )
   }

   return useSWR(key, swrFetcher, swrOptions)
}

export default useLivestreamCategoryDataSWR

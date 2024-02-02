import { LivestreamsTokenOptions } from "@careerfairy/shared-lib/livestreams"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

export type useLivestreamSecureTokenOptions = {
   livestreamId: string
   disabled?: boolean
}

const useLivestreamSecureTokenSWR = (
   options: useLivestreamSecureTokenOptions
) => {
   const key = options ? [options.livestreamId, options.disabled] : null

   const fetchLivestreamToken: LivestreamsTokenOptions = {
      livestreamId: options.livestreamId,
      type: "SECURE",
   }
   return useSWR(
      key,
      () => livestreamService.fetchLivestreamToken(fetchLivestreamToken),
      swrOptions
   )

   //    return {
   //       token,
   //       isLoading: tokenIsValidating,
   //       isError: Boolean(tokenError),
   //       reFetchToken: mutate,
   //    }
}

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: true,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestreams with options: ${key}`,
      }),
}

export default useLivestreamSecureTokenSWR

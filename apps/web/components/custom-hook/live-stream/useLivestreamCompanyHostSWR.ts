import { livestreamService } from "data/firebase/LivestreamService"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   suspense: true,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching live stream host data with options: ${key}`,
      }),
}

/**
 * Used to get the company host of the live stream
 *
 * @param livestreamId the live stream id
 * @returns the Group of the live stream's host or null if there are
 * multiple hosts or the host is a university
 **/
const useLivestreamCompanyHostSWR = (livestreamId: string) => {
   const swrFetcher = async () => {
      return livestreamService.getLivestreamHost(livestreamId)
   }

   return useSWR(`livestream-host-${livestreamId}`, swrFetcher, swrOptions)
}

export default useLivestreamCompanyHostSWR

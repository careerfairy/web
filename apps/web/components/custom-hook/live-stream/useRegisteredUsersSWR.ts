import { livestreamService } from "data/firebase/LivestreamService"
import { useMemo, useCallback } from "react"
import useSWR, { SWRConfiguration } from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export type UseRegisteredUsersOptions = {
   livestreamId: string
}
const useRegisteredUsersSWR = (options: UseRegisteredUsersOptions) => {
   const key = useMemo(
      () => (!options.livestreamId ? null : JSON.stringify(options)),
      [options]
   )

   const swrFetcher = useCallback(
      () =>
         livestreamService.fetchLivestreamRegisteredUsers(options.livestreamId),
      [options]
   )

   return useSWR(key, swrFetcher, swrOptions)
}

const swrOptions: SWRConfiguration = {
   ...reducedRemoteCallsOptions,
   keepPreviousData: false,
   suspense: false,
   onError: (error, key) =>
      errorLogAndNotify(error, {
         message: `Error fetching livestreams registered users with options: ${key}`,
      }),
}

export default useRegisteredUsersSWR

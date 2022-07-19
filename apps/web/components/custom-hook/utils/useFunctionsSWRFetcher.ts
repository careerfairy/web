import { useFunctions } from "reactfire"
import { useCallback } from "react"
import { httpsCallable } from "firebase/functions"

/**
 * SWR fetcher that calls Firebase cloud functions
 * The args should be an array with two values
 * [functionName, dataArguments]
 */
function useFunctionsSWRFetcher<ResponseType>() {
   const functionsInstance = useFunctions() // provided at _app.tsx

   return useCallback(
      (...args) => {
         const [functionName, dataArgument] = args

         return httpsCallable<unknown, ResponseType>(
            functionsInstance,
            functionName
         )(dataArgument).then((res) => res.data)
      },
      [functionsInstance]
   )
}

/**
 * SWR options that aim to reduce the number of function calls
 *
 * https://swr.vercel.app/docs/options
 */
export const reducedRemoteCallsOptions = {
   suspense: true,
   // minimize the api calls
   revalidateIfStale: false,
   revalidateOnFocus: false,
   revalidateOnMount: true,
   revalidateOnReconnect: false,
   dedupingInterval: 5000,
   focusThrottleInterval: 10000, //only revalidate once during a time span in milliseconds
   loadingTimeout: 5000,
}

export default useFunctionsSWRFetcher

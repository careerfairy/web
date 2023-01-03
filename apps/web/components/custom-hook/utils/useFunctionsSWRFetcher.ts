import { useFunctions } from "reactfire"
import { useCallback } from "react"
import { httpsCallable } from "firebase/functions"
import { SWRConfiguration } from "swr"

// tuple type
// string = function name
// object = function arguments
type FunctionCallArgumentFetcher = [string, object]

/**
 * SWR fetcher that calls Firebase cloud functions
 * The args should be an array with two values
 * [functionName, dataArguments]
 */
function useFunctionsSWRFetcher<ResponseType>() {
   const functionsInstance = useFunctions() // provided at _app.tsx

   return useCallback(
      (...args: FunctionCallArgumentFetcher[]) => {
         if (typeof args[0] === "string") {
            // wrap in array if only one call
            args = [args] as FunctionCallArgumentFetcher[]
         }

         let promises = []

         for (let arg of args) {
            let [functionName, dataArguments] = arg

            let callable = httpsCallable<unknown, ResponseType>(
               functionsInstance,
               functionName
            )

            promises.push(callable(dataArguments).then((res) => res.data))
         }

         if (promises.length === 1) {
            // return a single value if we only have one promise
            // keeps the contract used until now
            return promises[0]
         }

         return Promise.all(promises)
      },
      [functionsInstance]
   )
}

/**
 * SWR options that aim to reduce the number of function calls
 *
 * https://swr.vercel.app/docs/options
 */
export const reducedRemoteCallsOptions: SWRConfiguration = {
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

import { FunctionsInstance } from "data/firebase/FirebaseInstance"
import useSWRImmutable from "swr/immutable"
import { errorLogAndNotify } from "util/CommonUtil"

/**
 * A custom hook that fetches the user's country code based on their IP address.
 *
 * The country code is determined server-side using Google App Engine's "x-appengine-country" header,
 * which is based on the request's IP address.
 *
 * @returns {Object} An object containing:
 *   - userCountryCode: (string | undefined) The two-letter country code (e.g., "US", "GB", "DE")
 *   - isLoading: (boolean) Loading state of the request
 *
 */
const useUserCountryCode = () => {
   const { data: userCountryCode, isLoading } = useSWRImmutable(
      "fetchUserCountryCode",
      async () => {
         const result = await FunctionsInstance.httpsCallable(
            "fetchUserCountryCode"
         )()

         return result.data as string
      },
      {
         onError: (error, key) => {
            return errorLogAndNotify(error, {
               message: "Failed to fetch user's country code",
               args: key,
            })
         },
      }
   )

   return { userCountryCode, isLoading }
}

export default useUserCountryCode

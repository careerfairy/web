import { FunctionsInstance } from "data/firebase/FirebaseInstance"
import useSWRImmutable from "swr/immutable"
import { errorLogAndNotify } from "util/CommonUtil"

const useAnonymousUserCountryCode = () => {
   const { data: anonymousUserCountryCode, isLoading } = useSWRImmutable(
      "fetchAnonymousUserCountryCode",
      async () => {
         const result = await FunctionsInstance.httpsCallable(
            "fetchAnonymousUserCountryCode"
         )()

         return result.data
      },
      {
         onError: (error, key) => {
            return errorLogAndNotify(error, {
               message: "Failed to fetch anonymous user country code",
               args: key,
            })
         },
      }
   )

   return { anonymousUserCountryCode, isLoading }
}

export default useAnonymousUserCountryCode

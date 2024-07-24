import { FunctionsInstance } from "data/firebase/FirebaseInstance"
import useSWRImmutable from "swr/immutable"
import { errorLogAndNotify } from "util/CommonUtil"

const useUserCountryCode = () => {
   const { data: userCountryCode, isLoading } = useSWRImmutable(
      "fetchUserCountryCode",
      async () => {
         const result = await FunctionsInstance.httpsCallable(
            "fetchUserCountryCode"
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

   return { userCountryCode, isLoading }
}

export default useUserCountryCode

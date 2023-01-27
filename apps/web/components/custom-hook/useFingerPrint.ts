import FingerprintJS from "@fingerprintjs/fingerprintjs"
import useSWRImmutable from "swr/immutable" // To prevent revalidation, only fetch on mount once https://swr.vercel.app/blog/swr-v1#immutable-mode
import { SWRResponse } from "swr"

const fingerPrintFetcher = async () => {
   // Initialize an agent at application startup.
   const fp = await FingerprintJS.load({
      monitoring: false, // Disable monitoring to prevent the agent from sending requests to their backend.
   })

   // Get the visitor identifier when you need it.
   const result = await fp.get()

   return result.visitorId
}

type Result = SWRResponse<string, Error>
const useFingerPrint = (): Result => {
   return useSWRImmutable<string>("visitorId", fingerPrintFetcher)
}

export default useFingerPrint

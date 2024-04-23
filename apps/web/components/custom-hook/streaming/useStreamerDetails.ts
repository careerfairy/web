import { UID } from "agora-rtc-react"
import { errorLogAndNotify } from "util/CommonUtil"
import { livestreamService } from "data/firebase/LivestreamService"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"
import useSWR from "swr"

export type StreamerDetails = Awaited<
   ReturnType<typeof livestreamService.getStreamerDetails>
>

const initialData: StreamerDetails = {
   firstName: "",
   lastName: "",
   role: "",
   avatarUrl: "",
   linkedInUrl: "",
}

export const useStreamerDetails = (uid: UID) => {
   return useSWR<StreamerDetails>(
      uid ? `streamer-details-${uid}` : null,
      async () => {
         // Call the service only if uid is present
         if (uid) {
            return livestreamService.getStreamerDetails(uid.toString())
         }
         // Return initialData directly if uid is not present
         return initialData
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) =>
            errorLogAndNotify(error, {
               message: "Error fetching streamer details",
               key,
            }),
         suspense: false,
         fallbackData: initialData,
      }
   )
}

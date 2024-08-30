import { UID } from "agora-rtc-react"
import { livestreamService } from "data/firebase/LivestreamService"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

export type StreamerDetails = Awaited<
   ReturnType<typeof livestreamService.getParticipantDetails>
>

const initialData: StreamerDetails = {
   firstName: "",
   lastName: "",
   role: "",
   avatarUrl: "",
   linkedInUrl: "",
   id: "",
   groupId: "",
}

export const useStreamerDetails = (uid: UID) => {
   return useSWR<StreamerDetails>(
      uid ? `streamer-details-${uid}` : null,
      async () => {
         // Call the service only if uid is present
         if (uid) {
            return livestreamService.getParticipantDetails(uid.toString())
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

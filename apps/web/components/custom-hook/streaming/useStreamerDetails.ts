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
      async () => livestreamService.getStreamerDetails(uid.toString()),
      {
         ...reducedRemoteCallsOptions,
         onError: errorLogAndNotify,
         suspense: false,
         fallbackData: initialData,
      }
   )
}

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams/livestreams"
import { useNextLivestreamsSWR } from "../live-stream/useNextlivestreamsSWR"

type Options = {
   initialData?: LivestreamEvent[]
   suspense?: boolean
   limit?: number
}

export const useUpcomingPanelEventsSWR = (options?: Options) => {
   return useNextLivestreamsSWR({
      filters: {
         isPanel: true,
      },
      ...options,
      includeHidden: true, // TODO: remove this before release
   })
}

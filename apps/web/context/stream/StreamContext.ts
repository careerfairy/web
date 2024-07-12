import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import React, { useContext } from "react"

const CurrentStreamContext = React.createContext<CurrentStreamContextInterface>(
   {
      currentLivestream: null,
      isBreakout: false,
      isStreamer: false,
      isMainStreamer: false,
      streamerId: "",
      handRaiseId: undefined,
      isMobile: undefined,
      streamAdminPreferences: undefined,
      selectedState: "questions",
      presenter: null,
   } as CurrentStreamContextInterface
)

export interface CurrentStreamContextInterface {
   currentLivestream: LivestreamEvent
   isBreakout: boolean
   isStreamer: boolean
   isMainStreamer: boolean
   streamerId: string
   handRaiseId: string
   isMobile: boolean
   streamAdminPreferences: any
   /**
    *  The view of the left menu in the stream
    * */
   selectedState: "questions" | "polls" | "hand" | "chat" | "jobs" | "support"
   presenter: LivestreamPresenter
}
const useCurrentStream = () => {
   if (!CurrentStreamContext) {
      throw new Error(
         "useCurrentStream must be used within a CurrentStreamProvider"
      )
   }
   return useContext(CurrentStreamContext)
}

export { CurrentStreamContext, useCurrentStream }

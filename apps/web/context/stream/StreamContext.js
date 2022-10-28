import React, { useContext } from "react"

const CurrentStreamContext = React.createContext({
   currentLivestream: null,
   isBreakout: false,
   isStreamer: false,
   isMainStreamer: false,
   streamerId: "",
   handRaiseId: undefined,
   isMobile: undefined,
   streamAdminPreferences: undefined,
   selectedState: "questions",
})

const useCurrentStream = () => useContext(CurrentStreamContext)

export { CurrentStreamContext, useCurrentStream }

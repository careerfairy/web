import { ResponsiveStreamButton } from "../common"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useState } from "react"

export const ToggleStartLiveStreamButton = () => {
   const [hasStartedLivestream, setHasStartedLivestream] =
      useState<boolean>(false)

   const isMobile = useStreamIsMobile(390)

   return (
      <ResponsiveStreamButton
         onClick={() => setHasStartedLivestream(!hasStartedLivestream)}
         color={hasStartedLivestream ? "error" : "primary"}
         variant="contained"
      >
         {hasStartedLivestream
            ? isMobile
               ? "Stop"
               : "End live stream"
            : isMobile
            ? "Start"
            : "Start live stream"}
      </ResponsiveStreamButton>
   )
}

import { useIsMobile } from "@careerfairy/shared-ui"
import { ResponsiveButton } from "@careerfairy/shared-ui"
import React from "react"

export const ToggleStartLiveStreamButton = () => {
   const [hasStartedLivestream, setHasStartedLivestream] =
      React.useState<boolean>(false)

   const isMobile = useIsMobile(390)

   return (
      <ResponsiveButton
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
      </ResponsiveButton>
   )
}

import { ResponsiveButton } from "@careerfairy/shared-ui"
import React from "react"

export const ToggleStartLiveStreamButton = () => {
   const [hasStartedLivestream, setHasStartedLivestream] =
      React.useState<boolean>(false)
   return (
      <ResponsiveButton
         onClick={() => setHasStartedLivestream(!hasStartedLivestream)}
         color={hasStartedLivestream ? "error" : "primary"}
         variant="contained"
      >
         {hasStartedLivestream ? "End live stream" : "Start live stream"}
      </ResponsiveButton>
   )
}

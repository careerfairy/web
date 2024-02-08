import { sxStyles } from "types/commonTypes"
import { Box } from "@mui/material"
import React from "react"
import { useStreamingContext } from "../../context"
import { useIsConnected } from "agora-rtc-react"
import { LocalMicrophoneAndCameraUser } from "../streaming/LocalMicrophoneAndCameraUser"

const styles = sxStyles({
   root: {
      flex: 1,
   },
})

export const StreamingGrid = () => {
   const { isReady, shouldStream } = useStreamingContext()
   const isConnected = useIsConnected()

   const showLocalUser = isReady && shouldStream && isConnected

   return (
      <Box sx={styles.root}>
         {Boolean(showLocalUser) && (
            <LocalMicrophoneAndCameraUser height="100%" containVideo />
         )}
      </Box>
   )
}

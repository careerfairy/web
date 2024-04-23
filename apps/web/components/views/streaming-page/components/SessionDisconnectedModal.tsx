import { Box } from "@mui/material"
import { keyframes } from "@mui/system"
import { useConnectionState } from "agora-rtc-react"
import { ConnectionStates } from "constants/streaming"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { Loader } from "react-feather"
import { sxStyles } from "types/commonTypes"

const rotate = keyframes`
   from {
      transform: rotate(0deg);
   }
   to {
      transform: rotate(360deg);
   }
`

const styles = sxStyles({
   inFront: {
      zIndex: (theme) => theme.zIndex.modal + 1,
   },
   icon: {
      color: (theme) => theme.palette.error["500"],
      animation: `${rotate} 3s linear infinite`,
      width: "48px !important",
      height: "48px !important",
   },
})

export const SessionDisconnectedModal = () => {
   const rtcConnectionState = useConnectionState()
   const isDisconnected = useMemo(
      () => rtcConnectionState === ConnectionStates.RECONNECTING,
      [rtcConnectionState]
   )

   const { reload: handleReload } = useRouter()

   return (
      <ConfirmationDialog
         title="Your connection got interrupted"
         description="We're trying to reconnect you. In the meantime, you can try refreshing the page."
         open={isDisconnected}
         icon={<Box component={Loader} sx={styles.icon} />}
         primaryAction={{
            callback: handleReload,
            text: "Refresh page",
            variant: "contained",
            color: "error",
         }}
         sx={styles.inFront}
      />
   )
}

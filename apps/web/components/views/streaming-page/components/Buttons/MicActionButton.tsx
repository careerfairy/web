import { forwardRef } from "react"
import { Mic, MicOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"
import { Tooltip } from "@mui/material"
import { getDeviceButtonColor, getDeviceErrorMessage } from "../../util"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"

const styles = sxStyles({
   off: {
      "& svg": {
         color: "error.main",
      },
   },
})

export const MicActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const {
         toggleMicMuted,
         microphoneMuted: micMuted,
         microphoneOn: micOn,
         localMicrophoneTrack: { isLoading },
         microphoneError: micError,
      } = useLocalTracks()

      const active = micOn && !micMuted

      return (
         <Tooltip
            placement="top"
            title={getDeviceErrorMessage(micError, {
               permissionDenied:
                  "Microphone permission denied. Please enable it in your browser settings.",
               notReadable: "Microphone in use by another app.",
               unknown: "Some error occurred with the microphone.",
            })}
         >
            <BrandedBadge
               color="warning"
               badgeContent={micError ? "!" : undefined}
            >
               <ActionBarButtonStyled
                  color={getDeviceButtonColor(active, isLoading, micError)}
                  ref={ref}
                  onClick={toggleMicMuted}
                  sx={active ? undefined : styles.off}
                  disabled={Boolean(micError) || isLoading}
                  {...props}
               >
                  {active ? <Mic /> : <MicOff />}
               </ActionBarButtonStyled>
            </BrandedBadge>
         </Tooltip>
      )
   }
)

MicActionButton.displayName = "MicActionButton"

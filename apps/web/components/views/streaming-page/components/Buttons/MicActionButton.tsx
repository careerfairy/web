import { forwardRef } from "react"
import { Mic, MicOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"
import { getDeviceButtonColor, getMicrophoneErrorMessage } from "../../util"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"

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
         fetchMicsError,
      } = useLocalTracks()

      const active = micOn && !micMuted

      return (
         <DeviceErrorWrapper
            errorMessage={getMicrophoneErrorMessage(micError || fetchMicsError)}
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
         </DeviceErrorWrapper>
      )
   }
)

MicActionButton.displayName = "MicActionButton"

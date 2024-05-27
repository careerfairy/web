import { forwardRef } from "react"
import { Mic, MicOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { getDeviceButtonColor, getMicrophoneErrorMessage } from "../../util"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   off: {
      "& svg": {
         color: "error.main",
      },
   },
})

export const MicActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   ({ enableTooltip, ...props }, ref) => {
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
            <BrandedTooltip
               title={
                  enableTooltip
                     ? active
                        ? ActionTooltips.MicMute
                        : ActionTooltips.MicUnmute
                     : null
               }
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
            </BrandedTooltip>
         </DeviceErrorWrapper>
      )
   }
)

MicActionButton.displayName = "MicActionButton"

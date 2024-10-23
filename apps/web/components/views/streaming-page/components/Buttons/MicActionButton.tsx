import { forwardRef, useCallback } from "react"
import { Mic, MicOff } from "react-feather"
import { useDispatch } from "react-redux"
import { setDeniedPermissionsDialogOpen } from "store/reducers/streamingAppReducer"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { getDeviceButtonColor, getMicrophoneErrorMessage } from "../../util"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { DeviceErrorWrapper } from "../DeviceErrorWrapper"
import { useMediaPermissions } from "../StreamSetupWidget/permissions/useMediaPermissions"
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

      const { hasDeniedPermissions } = useMediaPermissions()

      const dispatch = useDispatch()

      const onClickHandler = useCallback(() => {
         if (hasDeniedPermissions) {
            dispatch(setDeniedPermissionsDialogOpen(true))
         } else {
            toggleMicMuted()
         }
      }, [dispatch, hasDeniedPermissions, toggleMicMuted])

      return (
         <DeviceErrorWrapper
            errorMessage={getMicrophoneErrorMessage(micError || fetchMicsError)}
         >
            <BrandedTooltip
               title={
                  enableTooltip && !hasDeniedPermissions
                     ? active
                        ? ActionTooltips.MicMute
                        : ActionTooltips.MicUnmute
                     : null
               }
            >
               <ActionBarButtonStyled
                  color={getDeviceButtonColor(
                     active,
                     isLoading,
                     Boolean(micError) || hasDeniedPermissions
                  )}
                  ref={ref}
                  onClick={onClickHandler}
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

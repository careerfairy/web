import { forwardRef, useCallback } from "react"
import { Video, VideoOff } from "react-feather"
import { useDispatch } from "react-redux"
import { setDeniedPermissionsDialogOpen } from "store/reducers/streamingAppReducer"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context/LocalTracks"
import { getCameraErrorMessage, getDeviceButtonColor } from "../../util"
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

export const VideoActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const {
      toggleCamera,
      cameraOn,
      localCameraTrack: { isLoading },
      cameraError,
      fetchCamerasError,
   } = useLocalTracks()

   const { hasDeniedPermissions } = useMediaPermissions()
   const dispatch = useDispatch()

   const onClickHandler = useCallback(() => {
      if (hasDeniedPermissions) {
         dispatch(setDeniedPermissionsDialogOpen(true))
      } else {
         toggleCamera()
      }
   }, [dispatch, hasDeniedPermissions, toggleCamera])

   return (
      <DeviceErrorWrapper
         errorMessage={getCameraErrorMessage(cameraError || fetchCamerasError)}
      >
         <BrandedTooltip
            title={
               enableTooltip
                  ? cameraOn
                     ? ActionTooltips.VideoTurnOff
                     : ActionTooltips.VideoTurnOn
                  : null
            }
         >
            <ActionBarButtonStyled
               color={getDeviceButtonColor(
                  cameraOn,
                  isLoading,
                  Boolean(cameraError) || hasDeniedPermissions
               )}
               ref={ref}
               onClick={onClickHandler}
               sx={cameraOn ? undefined : styles.off}
               disabled={Boolean(cameraError) || isLoading}
               {...props}
            >
               {cameraOn ? <Video /> : <VideoOff />}
            </ActionBarButtonStyled>
         </BrandedTooltip>
      </DeviceErrorWrapper>
   )
})

VideoActionButton.displayName = "VideoActionButton"

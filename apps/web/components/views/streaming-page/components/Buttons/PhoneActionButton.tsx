import { Box } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { forwardRef, useCallback } from "react"
import { Phone } from "react-feather"
import { setIsSpyMode } from "store/reducers/streamingAppReducer"
import {
   useAssistantMode,
   useIsSpyMode,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   active: {
      backgroundColor: (theme) => theme.brand.error[500],
      borderColor: (theme) => theme.brand.error[600],
      "& svg": {
         color: "common.white",
      },
      "&:hover": {
         backgroundColor: (theme) => theme.brand.error[600],
      },
   },
   inactive: {
      "& svg": {
         color: "primary.main",
      },
   },
})

export const PhoneActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const dispatch = useAppDispatch()
   const isSpyMode = useIsSpyMode()
   const isAssistantMode = useAssistantMode()
   const {
      toggleMicMuted,
      toggleCamera,
      microphoneMuted: micMuted,
      cameraOn,
   } = useLocalTracks()

   const active = !isSpyMode

   const onClickHandler = useCallback(() => {
      const newSpyMode = !isSpyMode
      dispatch(setIsSpyMode(newSpyMode))

      // Reset readiness: if joining (spy mode off), ensure mic/video are muted/off
      // If returning to assistant (spy mode on), keep current state
      if (!newSpyMode) {
         // Joining: mute mic and turn off video
         // if (!micMuted) {
         //    toggleMicMuted()
         // }
         // if (cameraOn) {
         //    toggleCamera()
         // }
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dispatch, isSpyMode, micMuted, cameraOn, toggleMicMuted, toggleCamera])

   // Only show when assistant mode is active
   if (!isAssistantMode) {
      return null
   }

   return (
      <BrandedTooltip
         title={
            enableTooltip
               ? active
                  ? "Return to assistant mode"
                  : "Join the stream"
               : null
         }
      >
         <ActionBarButtonStyled
            color="default"
            ref={ref}
            onClick={onClickHandler}
            sx={active ? styles.active : styles.inactive}
            {...props}
         >
            <Box
               sx={{
                  transform: active ? "rotate(135deg)" : "none",
               }}
               component={Phone}
            />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})

PhoneActionButton.displayName = "PhoneActionButton"

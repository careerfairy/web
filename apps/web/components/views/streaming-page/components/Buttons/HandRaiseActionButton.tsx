import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { useUserHasNoticedHandRaise } from "components/custom-hook/streaming/hand-raise/useUserHasNoticedHandRaise"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { HandRaiseIcon } from "components/views/common/icons"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useStreamingContext } from "components/views/streaming-page/context"
import { Fragment, forwardRef, useMemo } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import {
   useNumberOfHandRaiseNotifications,
   useStreamHandRaiseEnabled,
} from "store/selectors/streamingAppSelectors"
import { combineStyles, sxStyles } from "types/commonTypes"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ConfirmHandRaiseDialog } from "../hand-raise/ConfirmHandRaiseDialog"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   handRaiseActive: {
      backgroundColor: (theme) => `${theme.palette.primary.main} !important`,
      color: "white !important",
   },
})

export const HandRaiseActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )

   const numberOfHandRaiseNotifications = useNumberOfHandRaiseNotifications()
   const streamHandRaiseEnabled = useStreamHandRaiseEnabled()
   const { isHost, agoraUserId, livestreamId, setIsReady } =
      useStreamingContext()

   const { userHandRaiseIsActive: userHandRaiseActive } = useUserHandRaiseState(
      livestreamId,
      agoraUserId
   )

   const { trigger: updateHandRaiseState, isMutating } =
      useUpdateUserHandRaiseState(livestreamId)

   const handRaiseIsActiveForViewer = streamHandRaiseEnabled && !isHost

   const [
      isHandRaiseDialogOpen,
      handleOpenHandRaiseDialog,
      handleCloseHandRaiseDialog,
   ] = useDialogStateHandler()

   const { hasNoticed, setNoticed } = useUserHasNoticedHandRaise(livestreamId)

   const showHandRaiseNotice = useMemo(() => {
      return handRaiseIsActiveForViewer && !isHost && !hasNoticed
   }, [handRaiseIsActiveForViewer, isHost, hasNoticed])

   const badgeContent =
      numberOfHandRaiseNotifications || showHandRaiseNotice ? "!" : null

   const tooltipText = showHandRaiseNotice
      ? "Join the talk! The hand raise option is now active!"
      : enableTooltip
      ? ActionTooltips["Hand raise"]
      : null

   const handleClick = () => {
      if (isHost) {
         handleSetActive()
         return
      }

      if (userHandRaiseActive) {
         updateHandRaiseState({
            state: HandRaiseState.unrequested,
            handRaiseId: agoraUserId,
         }).then(() => {
            setIsReady(false)
         })
      } else {
         handleOpenHandRaiseDialog()
      }
   }

   return (
      <Fragment>
         <BrandedTooltip title={tooltipText}>
            <BrandedBadge color="error" badgeContent={badgeContent}>
               <ActionBarButtonStyled
                  id="hand-raise-button"
                  active={isActive}
                  onClick={() => {
                     if (showHandRaiseNotice) {
                        setNoticed()
                     }
                     handleClick()
                  }}
                  ref={ref}
                  {...props}
                  sx={combineStyles(
                     props.sx,
                     userHandRaiseActive && !isHost && styles.handRaiseActive
                  )}
                  color="primary"
               >
                  <HandRaiseIcon />
               </ActionBarButtonStyled>
            </BrandedBadge>
         </BrandedTooltip>
         <ConfirmHandRaiseDialog
            handleClose={handleCloseHandRaiseDialog}
            open={Boolean(isHandRaiseDialogOpen && handRaiseIsActiveForViewer)}
            onConfirm={() => {
               setIsReady(false)
               return updateHandRaiseState({
                  state: HandRaiseState.acquire_media,
                  handRaiseId: agoraUserId,
               })
            }}
            loading={isMutating}
         />
      </Fragment>
   )
})

HandRaiseActionButton.displayName = "HandRaiseActionButton"

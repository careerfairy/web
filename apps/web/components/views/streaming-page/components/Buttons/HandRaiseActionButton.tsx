import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { HandRaiseIcon } from "components/views/common/icons"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useStreamingContext } from "components/views/streaming-page/context"
import {
   Fragment,
   forwardRef,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
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

   const [
      viewerHandRaiseActiveTooltipInfoOpen,
      setViewerHandRaiseActiveTooltipInfoOpen,
   ] = useState(false)

   // Open tooltip for 7 seconds whenever handRaiseIsActiveForViewer changes to true
   useEffect(() => {
      if (handRaiseIsActiveForViewer) {
         setViewerHandRaiseActiveTooltipInfoOpen(true)
         const timer = setTimeout(() => {
            setViewerHandRaiseActiveTooltipInfoOpen(false)
         }, 7000)

         return () => clearTimeout(timer)
      }
   }, [handRaiseIsActiveForViewer])

   const closeViewerTooltip = useCallback(() => {
      viewerHandRaiseActiveTooltipInfoOpen &&
         setViewerHandRaiseActiveTooltipInfoOpen(false)
   }, [viewerHandRaiseActiveTooltipInfoOpen])

   const isViewerHandRaiseActiveTooltipInfoOpen = useMemo(() => {
      return viewerHandRaiseActiveTooltipInfoOpen && !isHost
   }, [viewerHandRaiseActiveTooltipInfoOpen, isHost])

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
         <BrandedTooltip
            title={"Join the talk! The hand raise option is now active!"}
            open={isViewerHandRaiseActiveTooltipInfoOpen}
            onClick={closeViewerTooltip}
            onMouseEnter={closeViewerTooltip}
            sx={{ maxWidth: "200px" }}
         >
            <BrandedTooltip
               title={enableTooltip ? ActionTooltips["Hand raise"] : null}
            >
               <BrandedBadge
                  color="error"
                  badgeContent={numberOfHandRaiseNotifications || null}
               >
                  <ActionBarButtonStyled
                     id="hand-raise-button"
                     active={isActive}
                     onClick={handleClick}
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

import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { HandRaiseIcon } from "components/views/common/icons"
import { useStreamingContext } from "components/views/streaming-page/context"
import { Fragment, forwardRef } from "react"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import { useStreamHandRaiseActive } from "store/selectors/streamingAppSelectors"
import { combineStyles, sxStyles } from "types/commonTypes"
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
>((props, ref) => {
   const { isHost, agoraUserId, livestreamId } = useStreamingContext()

   const streamHandRaiseIsActive = useStreamHandRaiseActive()

   const { isActive: userHandRaiseActive } = useUserHandRaiseState(
      livestreamId,
      agoraUserId
   )

   const handRaiseIsActiveForViewer = streamHandRaiseIsActive && !isHost

   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )

   const [
      isHandRaiseDialogOpen,
      handleOpenHandRaiseDialog,
      handleCloseHandRaiseDialog,
   ] = useDialogStateHandler()

   const handleClick = () => {
      if (isHost) {
         handleSetActive()
      } else {
         // Viewer logic
         if (userHandRaiseActive) {
            // stop the hand raise
            alert("stop the hand raise not implemented")
         } else {
            handleOpenHandRaiseDialog()
         }
      }
   }

   return (
      <Fragment>
         <ActionBarButtonStyled
            active={isActive}
            onClick={handleClick}
            ref={ref}
            {...props}
            sx={combineStyles(
               props.sx,
               handRaiseIsActiveForViewer && styles.handRaiseActive
            )}
            color="primary"
         >
            <HandRaiseIcon />
         </ActionBarButtonStyled>
         <ConfirmHandRaiseDialog
            handleClose={handleCloseHandRaiseDialog}
            open={Boolean(isHandRaiseDialogOpen && handRaiseIsActiveForViewer)}
         />
      </Fragment>
   )
})

HandRaiseActionButton.displayName = "HandRaiseActionButton"

import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useActiveSidePanelView } from "components/custom-hook/streaming"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
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
   const { handleSetActive, isActive } = useActiveSidePanelView(
      ActiveViews.HAND_RAISE
   )
   const streamHandRaiseIsActive = useStreamHandRaiseActive()
   const { isHost, agoraUserId, livestreamId, setIsReady } =
      useStreamingContext()

   const { userHandRaiseIsActive: userHandRaiseActive } = useUserHandRaiseState(
      livestreamId,
      agoraUserId
   )

   const { trigger: updateHandRaiseState, isMutating } =
      useUpdateUserHandRaiseState(livestreamId, agoraUserId)

   const handRaiseIsActiveForViewer = streamHandRaiseIsActive && !isHost

   const [
      isHandRaiseDialogOpen,
      handleOpenHandRaiseDialog,
      handleCloseHandRaiseDialog,
   ] = useDialogStateHandler()

   const handleClick = () => {
      if (isHost) {
         handleSetActive()
         return
      }
      // Viewer logic
      if (userHandRaiseActive) {
         updateHandRaiseState(HandRaiseState.unrequested).then(() => {
            setIsReady(false)
         })
      } else {
         handleOpenHandRaiseDialog()
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
            onConfirm={() => {
               setIsReady(false)
               return updateHandRaiseState(HandRaiseState.acquire_media)
            }}
            loading={isMutating}
         />
      </Fragment>
   )
})

HandRaiseActionButton.displayName = "HandRaiseActionButton"

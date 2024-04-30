import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { HandIcon } from "components/views/common/icons/HandIcon"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   handIcon: {
      width: "78px !important",
      height: "78px !important",
      color: "primary.main",
   },
})
type Props = {
   handleClose: () => void
   open: boolean
}

export const ConfirmHandRaiseDialog = ({ handleClose, open }: Props) => {
   const { agoraUserId, livestreamId } = useStreamingContext()

   const { trigger: triggerHandRaise, isMutating } =
      useUpdateUserHandRaiseState(
         livestreamId,
         agoraUserId,
         HandRaiseState.acquire_media
      )

   return (
      <ConfirmationDialog
         open={open}
         title={"You\u2019re about to raise your hand!"}
         handleClose={handleClose}
         description={
            <Fragment>
               {
                  "As soon as the streamer accepts your request you\u2019re going to actively join the live stream. Your camera and microphone will be active."
               }
               <br />
               <br />
               {"Would you like to proceed?"}
            </Fragment>
         }
         icon={<HandIcon sx={styles.handIcon} />}
         primaryAction={{
            callback: () => {
               triggerHandRaise().then(handleClose)
            },
            text: "Yes",
            color: "primary",
            loading: isMutating,
            variant: "contained",
         }}
         secondaryAction={{
            callback: () => handleClose(),
            text: "Cancel",
            color: "grey",
            variant: "outlined",
         }}
      />
   )
}

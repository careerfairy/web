import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { Box } from "@mui/material"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useEffect, useState } from "react"
import { ThumbsUp } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"

const styles = sxStyles({
   likeIcon: {
      color: "primary.main",
      width: "48px !important",
      height: "48px !important",
   },
})
const now = Date.now()
export const ThanksForJoiningHandRaiseDialog = () => {
   const [open, setOpen] = useState(false)

   const { livestreamId, agoraUserId } = useStreamingContext()
   const { handRaise } = useUserHandRaiseState(livestreamId, agoraUserId)

   const timeStamp = handRaise?.timeStamp.toMillis()
   useEffect(() => {
      if (handRaise?.state === HandRaiseState.denied && timeStamp >= now) {
         setOpen(true)
      }
   }, [handRaise.state, timeStamp])

   return (
      <ConfirmationDialog
         open={open}
         title="Thanks for joining!"
         description="The conversation keeps going. Feel free to raise your hand again if you have something else to ask."
         icon={<Box sx={styles.likeIcon} component={ThumbsUp} />}
         primaryAction={{
            text: "Keep watching",
            callback: () => setOpen(false),
            color: "primary",
            variant: "contained",
         }}
      />
   )
}

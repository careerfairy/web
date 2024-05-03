import { HandIcon } from "components/views/common/icons/HandIcon"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { Fragment } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   handIcon: {
      width: "78px !important",
      height: "78px !important",
      color: "primary.main",
   },
})
type Props = {
   handleClose: () => void
   onConfirm: () => Promise<void>
   loading: boolean
   open: boolean
}

export const ConfirmHandRaiseDialog = ({
   handleClose,
   open,
   onConfirm,
   loading,
}: Props) => {
   return (
      <ConfirmationDialog
         open={open}
         title={"You’re about to raise your hand!"}
         handleClose={handleClose}
         description={<Description />}
         icon={<HandIcon sx={styles.handIcon} />}
         primaryAction={{
            callback: () => {
               onConfirm().then(handleClose)
            },
            text: "Yes",
            color: "primary",
            loading: loading,
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

const Description = () => {
   return (
      <Fragment>
         As soon as the streamer accepts your request you’re going to actively
         join the live stream. Your camera and microphone will be active.
         <br />
         <br />
         Would you like to proceed?
      </Fragment>
   )
}

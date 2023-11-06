import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import { Button, DialogActions, DialogContentText } from "@mui/material"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { RootState } from "store"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   title: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   icon: {
      mr: 1,
   },
   link: {
      color: "primary.main",
      display: "inline",
      fontWeight: "bold",
   },
})

const ScreenShareDeniedModal = () => {
   const dispatch = useDispatch()
   const screenSharePermissionDenied = useSelector(
      (state: RootState) => state.stream.agoraState.screenSharePermissionDenied
   )

   const handleClose = () => {
      dispatch(actions.setScreenShareDeniedError(false))
   }

   return (
      <Dialog open={screenSharePermissionDenied}>
         <DialogTitle sx={styles.title}>
            <ScreenShareIcon sx={styles.icon} />
            Screen Share Not Allowed
         </DialogTitle>
         <DialogContent dividers>
            <DialogContentText align={"center"}>
               Unfortunately, your browser was not allowed to share your screen.
               If you did not actively cancel screen sharing, this indicates
               that your browser is missing the necessary permission for screen
               sharing.
               <br />
               <br />
               Please check your system&apos;s Security & Privacy settings to
               authorize your browser to share your screen or{" "}
               <Box
                  sx={styles.link}
                  component={"a"}
                  href={
                     "https://support.careerfairy.io/en/article/screen-sharing-issues-ctnit3"
                  }
                  target={"_blank"}
               >
                  read our documentation
               </Box>{" "}
               on how to fix this issue
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button color={"grey"} onClick={handleClose}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ScreenShareDeniedModal

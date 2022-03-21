import React from "react"
import {
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
} from "@mui/material"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"

const ScreenSharePermissionDeniedModal = ({
   screenSharePermissionDenied,
   setScreenSharePermissionDenied,
}) => {
   return (
      <Dialog open={Boolean(screenSharePermissionDenied)}>
         <DialogTitle>
            <div style={{ color: "lightgrey" }}>
               <ScreenShareIcon
                  style={{ verticalAlign: "middle", marginRight: "10px" }}
               />
               <span style={{ verticalAlign: "middle", marginRight: "10px" }}>
                  Missing Permission
               </span>
            </div>
         </DialogTitle>
         <DialogContent>
            <Box>
               <div>
                  Unfortunately, your browser was not allowed to share your
                  screen. If you did not actively cancel screen sharing, this
                  indicates that your browser is missing the necessary
                  permission for screen sharing. Please check your system's
                  Security & Privacy settings to authorize your browser to share
                  your screen.
               </div>
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setScreenSharePermissionDenied(false)}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ScreenSharePermissionDeniedModal

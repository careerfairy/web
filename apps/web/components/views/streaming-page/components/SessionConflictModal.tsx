import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import { useIsConnectedOnDifferentBrowser } from "store/selectors/streamingAppSelectors"
import { useRouter } from "next/router"

export const SessionConflictModal = () => {
   const IsConnectedOnDifferentBrowser = useIsConnectedOnDifferentBrowser()

   if (!IsConnectedOnDifferentBrowser) return null

   return (
      <Dialog open={IsConnectedOnDifferentBrowser}>
         <Content />
      </Dialog>
   )
}

const Content = () => {
   const { reload: handleReload } = useRouter()
   return (
      <>
         <DialogTitle>Session Conflict Detected</DialogTitle>
         <DialogContent>
            {`It looks like you're logged in from another browser or device.`}
         </DialogContent>
         <DialogActions>
            <Button onClick={handleReload} variant="contained" color="primary">
               CLICK HERE TO FORCE CONNECTION
            </Button>
         </DialogActions>
      </>
   )
}

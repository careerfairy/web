import React from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import { DialogActions } from "@mui/material"
import Button from "@mui/material/Button"
import { useRouter } from "next/router"

const UidConflict = () => {
   const router = useRouter()
   return (
      <Dialog open={true}>
         <DialogTitle>
            You seem to have the stream open on another window:
         </DialogTitle>
         <DialogActions
            sx={{
               justifyContent: "center",
            }}
         >
            <Button
               variant={"contained"}
               color={"secondary"}
               size={"large"}
               onClick={router.reload}
            >
               CLICK HERE TO FORCE CONNECTION
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default UidConflict

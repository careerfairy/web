import React, { useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import StepsView from "../common/StepsView"
import { useRouter } from "next/router"

const UidConflict = () => {
   const router = useRouter()
   const [steps] = useState([
      {
         title: "Close the stream and continue here",
         onClick: router.reload,
      },
   ])

   return (
      <Dialog open={true}>
         <DialogTitle>
            You seem to have the stream open on another window:
         </DialogTitle>
         <DialogContent dividers>
            <StepsView steps={steps} />
         </DialogContent>
      </Dialog>
   )
}

export default UidConflict

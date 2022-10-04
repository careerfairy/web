import React, { ComponentProps, FC } from "react"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import StepsView, { StepCard } from "../common/StepsView"

interface Props {
   steps: ComponentProps<typeof StepCard>[]
}
const DebugModal: FC<Props> = (props) => {
   return (
      <Dialog open={true}>
         <DialogTitle>Having issues? Here are some possible fixes:</DialogTitle>
         <DialogContent dividers>
            <StepsView steps={props.steps} />
         </DialogContent>
      </Dialog>
   )
}

export default DebugModal

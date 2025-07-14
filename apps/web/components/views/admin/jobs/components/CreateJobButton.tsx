import { Button, ButtonProps } from "@mui/material"
import { FC } from "react"
import { PlusCircle } from "react-feather"
import { combineStyles, sxStyles } from "../../../../../types/commonTypes"
import { useJobDialogRouter } from "../../../../custom-hook/custom-job/useJobDialogRouter"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateJobButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const { openJobDialog } = useJobDialogRouter()

   return (
      <Button
         onClick={openJobDialog}
         color="secondary"
         sx={combineStyles(styles.root, sx)}
         variant="contained"
         startIcon={<PlusCircle />}
         {...props}
      >
         {children || "Create new job"}
      </Button>
   )
}

export default CreateJobButton

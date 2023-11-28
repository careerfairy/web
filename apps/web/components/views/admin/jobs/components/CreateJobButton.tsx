import { Button, ButtonProps } from "@mui/material"
import { FC, useCallback } from "react"
import { sxStyles } from "../../../../../types/commonTypes"
import { useDispatch } from "react-redux"
import { openJobsDialog } from "../../../../../store/reducers/adminJobsReducer"
import { PlusCircle } from "react-feather"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateJobButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const dispatch = useDispatch()

   const handleCreateJob = useCallback(() => {
      dispatch(openJobsDialog())
   }, [dispatch])

   return (
      <Button
         onClick={handleCreateJob}
         color="secondary"
         sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
         variant="contained"
         startIcon={<PlusCircle />}
         {...props}
      >
         {children || "Create new job"}
      </Button>
   )
}

export default CreateJobButton

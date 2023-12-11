import { Button, ButtonProps } from "@mui/material"
import { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"
import SparksDialog from "../sparks-dialog/SparksDialog"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<ButtonProps> = ({ sx, children, ...props }) => {
   const dispatch = useDispatch()

   const handleOpen = useCallback(() => {
      dispatch(openSparkDialog(null))
   }, [dispatch])

   return (
      <>
         <Button
            onClick={handleOpen}
            color="secondary"
            sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]}
            variant="contained"
            {...props}
         >
            {children || "Upload a new Spark"}
         </Button>
         <SparksDialog />
      </>
   )
}

export default CreateSparkButton

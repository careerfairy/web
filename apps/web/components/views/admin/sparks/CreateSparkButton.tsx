import { Button } from "@mui/material"
import React, { FC, useCallback } from "react"
import { useDispatch } from "react-redux"
import { openSparkDialog } from "store/reducers/adminSparksReducer"
import { sxStyles } from "types/commonTypes"

type Props = {}

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<Props> = () => {
   const dispatch = useDispatch()

   const handleOpen = useCallback(() => {
      dispatch(openSparkDialog(null))
   }, [dispatch])

   return (
      <Button
         onClick={handleOpen}
         color="secondary"
         sx={styles.root}
         variant="contained"
      >
         Upload a new Spark
      </Button>
   )
}

export default CreateSparkButton

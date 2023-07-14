import { Button } from "@mui/material"
import React, { FC } from "react"
import { sxStyles } from "types/commonTypes"

type Props = {}

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const CreateSparkButton: FC<Props> = () => {
   return (
      <Button color="secondary" sx={styles.root} variant="contained">
         Upload a new spark
      </Button>
   )
}

export default CreateSparkButton

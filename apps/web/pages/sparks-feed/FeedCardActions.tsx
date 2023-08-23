import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: 63,

      /**
       * Demo props
       */
      maxHeight: "80vh",
      border: "1px solid purple",
      height: 402,
      borderRadius: 3.25,
      bgcolor: "red",
   },
})

type Props = {}

const FeedCardActions: FC<Props> = (props) => {
   return <Box sx={styles.root}></Box>
}

export default FeedCardActions

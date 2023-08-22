import Box from "@mui/material/Box"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: 63,
      border: "1px solid purple",
   },
})

type Props = {}

const FeedCardActions: FC<Props> = (props) => {
   return <Box sx={styles.root}>CardActions</Box>
}

export default FeedCardActions

import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      width: 63,
   },
})

type Props = {}

const FeedCardActions: FC<Props> = (props) => {
   return <Box sx={styles.root}>CardActions</Box>
}

export default FeedCardActions

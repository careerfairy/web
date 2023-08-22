import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import useSparksFeedIsFullScreen from "pages/sparks-feed/hooks/useSparksFeedIsFullScreen"

const styles = sxStyles({
   root: {
      borderRadius: 3.25,
      backgroundColor: "blue",
      width: "100%",
      height: "100%",
   },
   fullScreenRoot: {
      borderRadius: 0,
   },
})

type Props = {
   spark: SparkPresenter
}

const SparksFeedCard: FC<Props> = ({ spark }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   return <Box sx={[styles.root, isFullScreen && styles.fullScreenRoot]}></Box>
}

export default SparksFeedCard

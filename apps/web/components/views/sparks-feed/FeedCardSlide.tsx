import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import SparksFeedCard from "components/views/sparks/components/spark-card/SparksFeedCard"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import AspectRatio from "../common/AspectRatio"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      position: "relative",
   },
})

type Props = {
   spark: SparkPresenter
   playing: boolean
}

const FeedCardSlide: FC<Props> = ({ spark, playing }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   return (
      <Box sx={styles.root}>
         <AspectRatio aspectRatio={isFullScreen ? null : "9:16"}>
            <SparksFeedCard playing={playing} spark={spark} />
         </AspectRatio>
      </Box>
   )
}

export default FeedCardSlide

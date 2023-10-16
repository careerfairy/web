import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import SparksFeedCard from "components/views/sparks/components/spark-card/SparksFeedCard"
import { FC, ReactNode } from "react"
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

type Props = {}

const FeedCardSlide: FC<Props> = ({ children }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   return (
      <Box sx={styles.root}>
         <AspectRatio aspectRatio={isFullScreen ? null : "9:16"}>
            {children}
         </AspectRatio>
      </Box>
   )
}

export default FeedCardSlide

import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import SparksFeedCard from "components/views/sparks/components/spark-card/SparksFeedCard"
import { FC, SyntheticEvent, forwardRef } from "react"
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
   playing?: boolean
   paused?: boolean
   hide?: boolean
   isOverlayedOntop?: boolean
   hideVideo?: boolean
   handleClickCard?: (e: SyntheticEvent) => void
   identifier?: string
   scrolling?: boolean
}

const FeedCardSlide = forwardRef<HTMLDivElement, Props>(
   (
      {
         spark,
         playing,
         paused,
         hide,
         isOverlayedOntop,
         hideVideo,
         handleClickCard,
         identifier,
         scrolling,
      },
      ref
   ) => {
      const isFullScreen = useSparksFeedIsFullScreen()

      return (
         <Box sx={styles.root} ref={ref}>
            {hide ? null : (
               <AspectRatio aspectRatio={isFullScreen ? null : "9:16"}>
                  <SparksFeedCard
                     playing={playing}
                     spark={spark}
                     paused={paused}
                     isOverlayedOntop={isOverlayedOntop}
                     hideVideo={hideVideo}
                     handleClickCard={handleClickCard}
                     identifier={identifier}
                     scrolling={scrolling}
                  />
               </AspectRatio>
            )}
         </Box>
      )
   }
)

FeedCardSlide.displayName = "FeedCardSlide"

export default FeedCardSlide

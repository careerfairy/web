import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import SparksFeedCard from "components/views/sparks/components/spark-card/SparksFeedCard"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import AspectRatio from "../../components/views/common/AspectRatio"
import FeedCardActions from "./FeedCardActions"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      position: "relative",
   },
   actionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "translate(100%, 0)",
      pl: 2.25,
      pb: 4,
   },
   fullScreenActionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "none",
      pr: 1.5,
      pb: 3.25,
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
            <SparksFeedCard spark={spark} />
            <ActionsWrapper fullScreen={isFullScreen}>
               <FeedCardActions />
            </ActionsWrapper>
         </AspectRatio>
      </Box>
   )
}

type ActionsWrapperProps = {
   fullScreen: boolean
}

const ActionsWrapper: FC<ActionsWrapperProps> = ({ children, fullScreen }) => {
   return (
      <Box
         sx={[
            styles.actionsWrapper,
            fullScreen && styles.fullScreenActionsWrapper,
         ]}
      >
         {children}
      </Box>
   )
}

export default FeedCardSlide

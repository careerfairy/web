import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import Box from "@mui/material/Box"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import FeedCardActions from "./FeedCardActions"

const styles = sxStyles({
   root: {},
   actionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "translate(100%, 0)",
      border: "2px solid purple",
   },
   mobileActionsWrapper: {
      position: "absolute",
      bottom: "0",
      right: "0",
      transform: "none",
   },
   aspectRatioBox: {
      aspectRatio: "9 / 16",
      backgroundColor: "red",
      position: "relative",
   },
   mobileAspectRatioBox: {
      aspectRatio: "auto",
      width: "100%",
   },
})

type Props = {
   spark: SparkPresenter
   playing: boolean
}

const FeedCard: FC<Props> = ({ spark, playing }) => {
   const isMobile = useIsMobile()

   return (
      <Box
         width="100%"
         display="flex"
         justifyContent="center"
         position="relative"
      >
         <Box
            sx={[
               styles.aspectRatioBox,
               isMobile && styles.mobileAspectRatioBox,
            ]}
         >
            <ActionsWrapper mobile={isMobile}>
               <FeedCardActions />
            </ActionsWrapper>
         </Box>
      </Box>
   )
}

type ActionsWrapperProps = {
   mobile: boolean
}

const ActionsWrapper: FC<ActionsWrapperProps> = ({ children, mobile }) => {
   return (
      <Box sx={[styles.actionsWrapper, mobile && styles.mobileActionsWrapper]}>
         {children}
      </Box>
   )
}

export default FeedCard

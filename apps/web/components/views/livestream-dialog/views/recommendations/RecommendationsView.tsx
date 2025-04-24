import { Box, styled } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useLiveStreamDialog } from "../.."
import BaseDialogView from "../../BaseDialogView"
import { BlurredBackground } from "./BlurredBackground"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"

const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
      overflow: "hidden",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 4,
      zIndex: 1,
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
      width: "100%",
      minHeight: "100%",
   },
   title: {
      color: "common.white",
      mb: 2,
      fontWeight: 600,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   variantLabel: {
      color: "common.white",
      mb: 1,
      fontWeight: 500,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   gridContainer: {
      width: "100%",
      maxWidth: 1200,
   },
})

const Layout = styled(Box)({
   minHeight: "100%",
   position: "relative",
   display: "flex",
   flexDirection: "column",
})

// Wrap components with motion for animations
const AnimatedBlurredBackground = motion(BlurredBackground)

// Animation variants
const fadeAnimation = {
   initial: { opacity: 0 },
   animate: { opacity: 1, transition: { duration: 0.3 } },
   exit: { opacity: 0, transition: { duration: 0.3 } },
}

const RecommendationsView = () => {
   const isMobile = useIsMobile()
   const { livestream } = useLiveStreamDialog()

   const [showRecommendations, setShowRecommendations] = useState(false)

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>
               <AnimatePresence>
                  {Boolean(isMobile) && (
                     <RecommendationsNav key="recommendations-nav" />
                  )}
                  {Boolean(isMobile && !showRecommendations) && (
                     <AnimatedBlurredBackground
                        key="blurred-background"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={fadeAnimation}
                     >
                        <GetNotifiedCard
                           livestream={livestream}
                           onClose={() => setShowRecommendations(true)}
                        />
                     </AnimatedBlurredBackground>
                  )}
               </AnimatePresence>
            </Layout>
         }
      />
   )
}

export default RecommendationsView

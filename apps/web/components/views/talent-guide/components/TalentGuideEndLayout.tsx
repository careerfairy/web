import { Box, useMediaQuery } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence, Variants } from "framer-motion"
import { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { CongratsMessage } from "./feedback/CongratsMessage"
import { FeedbackCard } from "./feedback/FeedbackCard"
import { TalentGuideLayout } from "./TalentGuideLayout"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100dvh",
      position: "relative",
      overflow: "hidden",
   },
   resetButton: {
      position: "fixed",
      bottom: 16,
      left: 16,
   },
   feedbackCard: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      width: "100%",
   },
})

const feedbackVariants: Variants = {
   initial: {
      opacity: 0,
      bottom: 0,
      y: 20,
   },
   animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
      bottom: 0,
      y: 0,
   },
   exit: { opacity: 0 },
   center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
      top: "50%",
      transform: "translateY(-50%)",
   },
}

export const TalentGuideEndLayout = () => {
   const [enableRating, setEnableRating] = useState(false)
   const [showFeedback, setShowFeedback] = useState(false)
   const isShortScreen = useMediaQuery("(max-height: 730px)")
   const isShorterScreen = useMediaQuery("(max-height: 450px)")

   const congratsVariants: Variants = {
      initial: { opacity: 0, y: 20 },
      animate: {
         opacity: 1,
         y: 0,
         transform: isShorterScreen
            ? undefined
            : isShortScreen
            ? "translateY(-50%)"
            : undefined,
      },
      exit: {
         opacity: 0,
         y: "-100%",
         transition: { duration: 0.5, ease: "easeOut" },
      },
   }

   useEffect(() => {
      // Show feedback card after 2 seconds
      const timer = setTimeout(() => {
         setShowFeedback(true)
      }, 2000)

      return () => clearTimeout(timer)
   }, [])

   return (
      <TalentGuideLayout>
         <Box id="talent-guide-end-layout" sx={styles.root}>
            <AnimatePresence>
               {enableRating || (isShorterScreen && showFeedback) ? null : (
                  <FramerBox
                     key="congrats"
                     initial="initial"
                     animate="animate"
                     exit="exit"
                     variants={congratsVariants}
                     transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                     <CongratsMessage />
                  </FramerBox>
               )}

               {Boolean(showFeedback) && (
                  <FramerBox
                     key="feedback"
                     animate={
                        enableRating || isShorterScreen ? "center" : "animate"
                     }
                     initial="initial"
                     exit="exit"
                     transition={{ duration: 0.5, ease: "easeOut" }}
                     variants={feedbackVariants}
                     sx={styles.feedbackCard}
                  >
                     <FeedbackCard
                        onRatingClick={() => setEnableRating(true)}
                        preview={!enableRating}
                     />
                  </FramerBox>
               )}
            </AnimatePresence>
         </Box>
      </TalentGuideLayout>
   )
}

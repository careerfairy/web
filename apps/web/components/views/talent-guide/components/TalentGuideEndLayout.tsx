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
   feedbackCard: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      width: "100%",
   },
})

const CongratsSection = ({ isVisible, isShorterScreen, isShortScreen }) => {
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

   if (!isVisible) return null

   return (
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
   )
}

const FeedbackSection = ({
   isVisible,
   enableRating,
   isShorterScreen,
   onRatingClick,
}) => {
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

   if (!isVisible) return null

   return (
      <FramerBox
         key="feedback"
         animate={enableRating || isShorterScreen ? "center" : "animate"}
         initial="initial"
         exit="exit"
         transition={{ duration: 0.5, ease: "easeOut" }}
         variants={feedbackVariants}
         sx={styles.feedbackCard}
      >
         <FeedbackCard onRatingClick={onRatingClick} preview={!enableRating} />
      </FramerBox>
   )
}

export const TalentGuideEndLayout = () => {
   const [enableRating, setEnableRating] = useState(false)
   const [showFeedback, setShowFeedback] = useState(false)
   const isShortScreen = useMediaQuery("(max-height: 730px)")
   const isShorterScreen = useMediaQuery("(max-height: 450px)")

   useEffect(() => {
      const timer = setTimeout(() => {
         setShowFeedback(true)
      }, 2000)

      return () => clearTimeout(timer)
   }, [])

   return (
      <TalentGuideLayout>
         <Box id="talent-guide-end-layout" sx={styles.root}>
            <AnimatePresence>
               <CongratsSection
                  isVisible={
                     !enableRating && !(isShorterScreen && showFeedback)
                  }
                  isShorterScreen={isShorterScreen}
                  isShortScreen={isShortScreen}
               />
               <FeedbackSection
                  isVisible={showFeedback}
                  enableRating={enableRating}
                  isShorterScreen={isShorterScreen}
                  onRatingClick={() => setEnableRating(true)}
               />
            </AnimatePresence>
         </Box>
      </TalentGuideLayout>
   )
}

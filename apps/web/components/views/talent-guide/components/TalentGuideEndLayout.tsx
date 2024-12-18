import RefreshIcon from "@mui/icons-material/RestartAlt"
import { Box, Fab } from "@mui/material"
import FramerBox, { FramerBoxProps } from "components/views/common/FramerBox"
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
})

const congratsVariants: Variants = {
   initial: { opacity: 0, y: 20 },
   animate: { opacity: 1, y: 0 },
   exit: { opacity: 0, y: "-100%" },
}

const feedbackVariants: FramerBoxProps = {
   variants: {
      initial: {
         opacity: 0,
         y: "100%",
         x: "-50%",
         left: "50%",
         position: "absolute",
         bottom: "-12px",
      },
      animate: {
         opacity: 1,
         y: 0,
      },
      exit: {
         opacity: 0,
      },
      center: {
         y: "-50%",
         x: "-50%",
         left: "50%",
         top: "50%",
         scale: 1.1,
         opacity: 1,
      },
   },
   initial: "initial",
   exit: "exit",
   transition: {
      duration: 0.5,
      ease: "easeOut",
   },
}

export const TalentGuideEndLayout = () => {
   const [enableRating, setEnableRating] = useState(false)
   const [showFeedback, setShowFeedback] = useState(false)
   const [layoutKey, setLayoutKey] = useState(0)

   useEffect(() => {
      // Show feedback card after 2 seconds
      const timer = setTimeout(() => {
         setShowFeedback(true)
      }, 1000)

      return () => clearTimeout(timer)
   }, [])

   const handleResetLayout = () => {
      setLayoutKey((prev) => prev + 1)
   }

   return (
      <TalentGuideLayout key={layoutKey}>
         <Box id="talent-guide-end-layout" sx={styles.root}>
            <AnimatePresence>
               {!enableRating && (
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

               {/* <Collapse in={showFeedback} mountOnEnter unmountOnExit> */}
               {Boolean(showFeedback) && (
                  <FramerBox
                     key="feedback"
                     animate={enableRating ? "center" : "animate"}
                     {...feedbackVariants}
                  >
                     <FeedbackCard
                        onRatingClick={() => setEnableRating(true)}
                        preview={!enableRating}
                     />
                  </FramerBox>
               )}
               {/* </Collapse> */}
            </AnimatePresence>
         </Box>
         <Fab
            size="small"
            onClick={handleResetLayout}
            sx={styles.resetButton}
            color="secondary"
         >
            <RefreshIcon />
         </Fab>
      </TalentGuideLayout>
   )
}

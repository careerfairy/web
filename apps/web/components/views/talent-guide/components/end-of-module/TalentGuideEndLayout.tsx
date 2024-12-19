import { Box, useMediaQuery } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { TalentGuideLayout } from "../TalentGuideLayout"
import { CongratsSection } from "./CongratsSection"
import { FeedbackSection } from "./FeedbackSection"
import { styles } from "./styles"

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
         <Box id="talent-guide-end-layout" sx={styles.layoutRoot}>
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

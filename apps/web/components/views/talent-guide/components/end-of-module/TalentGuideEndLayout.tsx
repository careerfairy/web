import { Box, useMediaQuery } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { TalentGuideLayout } from "../TalentGuideLayout"
import { CongratsSection } from "./CongratsSection"
import { FeedbackSection } from "./FeedbackSection"
import { styles } from "./styles"

export const TalentGuideEndLayout = () => {
   const [ratingClicked, setRatingClicked] = useState(false)
   const [showFeedback, setShowFeedback] = useState(false)
   const isShortScreen = useMediaQuery("(max-height: 730px)")
   const isShorterScreen = useMediaQuery("(max-height: 450px)")

   useEffect(() => {
      const timer = setTimeout(() => {
         setShowFeedback(true)
      }, 2000)

      return () => clearTimeout(timer)
   }, [])

   const showCongrats = !ratingClicked && !(isShorterScreen && showFeedback)

   return (
      <TalentGuideLayout>
         <Box id="talent-guide-end-layout" sx={styles.layoutRoot}>
            <AnimatePresence>
               {Boolean(showCongrats) && (
                  <CongratsSection
                     key="congrats"
                     isShorterScreen={isShorterScreen}
                     isShortScreen={isShortScreen}
                  />
               )}
               {Boolean(showFeedback) && (
                  <FeedbackSection
                     key="feedback"
                     enableRating={ratingClicked}
                     isShorterScreen={isShorterScreen}
                     onRatingClick={() => setRatingClicked(true)}
                  />
               )}
            </AnimatePresence>
         </Box>
      </TalentGuideLayout>
   )
}

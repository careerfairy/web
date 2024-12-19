import { Box, useMediaQuery } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { TalentGuideLayout } from "../TalentGuideLayout"
import { CongratsSection } from "./CongratsSection"
import { FeedbackSection } from "./FeedbackSection"
import { styles } from "./styles"

const SHOW_CONGRATS_TIME = 2000

export const TalentGuideEndLayout = () => {
   const [ratingClicked, setRatingClicked] = useState(false)
   const [someTimeHasPassed, setSomeTimeHasPassed] = useState(false)
   const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

   const isShortScreen = useMediaQuery("(max-height: 730px)")
   const isShorterScreen = useMediaQuery("(max-height: 450px)")

   useEffect(() => {
      const timer = setTimeout(() => {
         setSomeTimeHasPassed(true)
      }, SHOW_CONGRATS_TIME)

      return () => clearTimeout(timer)
   }, [])

   const showCongrats =
      !ratingClicked && !(isShorterScreen && someTimeHasPassed)
   const showFeedback = someTimeHasPassed && !feedbackSubmitted

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
                     onFeedbackSubmitted={() => setFeedbackSubmitted(true)}
                  />
               )}
            </AnimatePresence>
         </Box>
      </TalentGuideLayout>
   )
}

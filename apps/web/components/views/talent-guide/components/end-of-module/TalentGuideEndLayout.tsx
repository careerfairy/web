import { Box, useMediaQuery } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { useAuth } from "HOCs/AuthProvider"
import { useNextTalentGuideModule } from "hooks/useNextTalentGuideModule"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { TalentGuideLayout } from "../TalentGuideLayout"
import { CongratsSection } from "./CongratsSection"
import { FeedbackSection } from "./FeedbackSection"
import { NextModuleSection } from "./NextModuleSection"
import { layoutStyles } from "./styles"

const SHOW_CONGRATS_TIME = 1000

export const TalentGuideEndLayout = () => {
   const { authenticatedUser } = useAuth()
   const { push } = useRouter()
   const [ratingClicked, setRatingClicked] = useState(false)
   const [someTimeHasPassed, setSomeTimeHasPassed] = useState(false)
   const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

   const isShortScreen = useMediaQuery("(max-height: 800px)")
   const isShorterScreen = useMediaQuery("(max-height: 530px)")

   const { data: nextModule } = useNextTalentGuideModule(
      authenticatedUser?.uid,
      "de",
      {
         onSuccess: (nextModule) => {
            if (!nextModule) {
               push("/talent-guide")
            }
         },
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error fetching next talent guide module",
               key,
            })
            push("/talent-guide")
         },
         suspense: false,
      }
   )

   useEffect(() => {
      const timer = setTimeout(() => {
         setSomeTimeHasPassed(true)
      }, SHOW_CONGRATS_TIME)

      return () => clearTimeout(timer)
   }, [])

   const showCongrats =
      !ratingClicked && !(isShorterScreen && someTimeHasPassed)
   const showFeedback = someTimeHasPassed && !feedbackSubmitted
   const showNextModule = feedbackSubmitted

   return (
      <TalentGuideLayout sx={{ px: { xs: 3.25, md: 0 }, maxWidth: 600 }}>
         <Box id="talent-guide-end-layout" sx={layoutStyles.root}>
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
               {Boolean(showNextModule) && (
                  <NextModuleSection
                     key="next-module"
                     nextModule={nextModule}
                  />
               )}
            </AnimatePresence>
         </Box>
      </TalentGuideLayout>
   )
}

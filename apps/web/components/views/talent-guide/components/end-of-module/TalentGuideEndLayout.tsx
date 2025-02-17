/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, useMediaQuery, Zoom } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { AnimatePresence } from "framer-motion"
import { useAuth } from "HOCs/AuthProvider"
import { useNextTalentGuideModule } from "hooks/useNextTalentGuideModule"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { trackLevelsComplete } from "store/reducers/talentGuideReducer"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { BackButton } from "../floating-buttons/BackButton"
import { TalentGuideLayout } from "../TalentGuideLayout"
import { CongratsSection } from "./CongratsSection"
import { FeedbackSection } from "./FeedbackSection"
import { NextModuleSection } from "./NextModuleSection"
import { layoutStyles } from "./styles"

const styles = sxStyles({
   root: {
      px: { xs: 3.25, md: 0 },
      maxWidth: 600,
   },
   backButton: {
      p: 1.5,
      position: "absolute",
      top: 55,
      right: 12,
   },
   zoomDelay: {
      transitionDelay: "3000ms",
   },
})

const SHOW_CONGRATS_TIME = 1000

export const TalentGuideEndLayout = () => {
   const random = useRef(Date.now())

   const { authenticatedUser } = useAuth()
   const { push } = useRouter()
   const [ratingClicked, setRatingClicked] = useState(false)
   const [someTimeHasPassed, setSomeTimeHasPassed] = useState(false)
   const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
   const [isRedirectingToOverview, setIsRedirectingToOverview] = useState(false)
   const dispatch = useAppDispatch()
   const isShorterScreen = useMediaQuery("(max-height: 590px)")

   const { data: nextModule, isLoading: isLoadingNextModule } =
      useNextTalentGuideModule(authenticatedUser?.uid, "de", {
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error fetching next talent guide module",
               key,
            })
            push("/levels")
         },
         suspense: false,
         noCache: true,
      })

   useEffect(() => {
      const hasCompletedAllLevels = !isLoadingNextModule && nextModule === null

      if (hasCompletedAllLevels && feedbackSubmitted) {
         dispatch(trackLevelsComplete())
         setIsRedirectingToOverview(true)
         push("/levels")

         return () => {
            setIsRedirectingToOverview(false)
         }
      }
   }, [nextModule, isLoadingNextModule, push, feedbackSubmitted, dispatch])

   useEffect(() => {
      const timer = setTimeout(() => {
         setSomeTimeHasPassed(true)
      }, SHOW_CONGRATS_TIME)

      return () => {
         setSomeTimeHasPassed(false)
         return clearTimeout(timer)
      }
   }, [])

   const showCongrats =
      !isLoadingNextModule &&
      !isRedirectingToOverview &&
      !ratingClicked &&
      !(isShorterScreen && someTimeHasPassed)
   const showFeedback = someTimeHasPassed && !feedbackSubmitted
   const showNextModule = Boolean(feedbackSubmitted && nextModule)

   return (
      <TalentGuideLayout key={random.current} sx={styles.root}>
         <Box id="talent-guide-end-layout" sx={layoutStyles.root}>
            <AnimatePresence>
               {Boolean(showCongrats) && (
                  <CongratsSection
                     key="congrats"
                     isShorterScreen={isShorterScreen}
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
         <Zoom unmountOnExit style={styles.zoomDelay} in={showNextModule}>
            <BackButton size={24} sx={styles.backButton} />
         </Zoom>
      </TalentGuideLayout>
   )
}

import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   Container,
   Grid,
   IconButton,
   IconButtonProps,
   styled,
   Typography,
   TypographyProps,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { X as CloseIcon } from "react-feather"
import { useLiveStreamDialog } from "../.."
import { BlurredBackground } from "./BlurredBackground"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"

const RecommendationsContainer = styled(Container)({
   display: "flex",
   flexDirection: "column",
   paddingTop: 40,
   paddingBottom: 16,
   flex: 1,
   position: "relative",
})

const Title = styled((props: TypographyProps) => (
   <Typography component="h5" {...props} />
))(({ theme }) => ({
   transition: theme.transitions.create(["all"]),
   textAlign: "center",
   marginBottom: 8,
}))

const Subtitle = styled((props: TypographyProps) => (
   <Typography component="p" variant="medium" {...props} />
))({
   textAlign: "center",
   marginBottom: 10,
})

const CloseButton = styled((props: IconButtonProps) => (
   <IconButton {...props}>
      <CloseIcon />
   </IconButton>
))({
   position: "absolute",
   top: 12,
   right: 12,
   padding: 4,
})

// Animation variants
const fadeAnimation = {
   initial: { opacity: 0 },
   animate: { opacity: 1, transition: { duration: 0.3 } },
   exit: { opacity: 0, transition: { duration: 0.3 } },
}

// Slide up animation for card list
const slideUpAnimation = {
   initial: { opacity: 0, y: 50 },
   animate: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.5,
         staggerChildren: 0.1,
         when: "beforeChildren",
      },
   },
   exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
}

// Animation for individual cards
const cardAnimation = {
   initial: { opacity: 0, y: 20 },
   animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
   },
}

export const MobileView = () => {
   const [showRecommendations, setShowRecommendations] = useState(false)

   const { livestream } = useLiveStreamDialog()

   return (
      <AnimatePresence>
         {Boolean(showRecommendations) && (
            <Recommendations key="recommendations" />
         )}
         <RecommendationsNav key="recommendations-nav" />
         {!showRecommendations && (
            <motion.div
               key="get-notified-card"
               initial="initial"
               animate="animate"
               exit="exit"
               variants={fadeAnimation}
            >
               <BlurredBackground>
                  <GetNotifiedCard
                     livestream={livestream}
                     onClose={() => setShowRecommendations(true)}
                  />
               </BlurredBackground>
            </motion.div>
         )}
      </AnimatePresence>
   )
}

const Recommendations = () => {
   const { events, loading } = useRecommendedEvents({ bypassCache: true })
   const { livestream, closeDialog } = useLiveStreamDialog()
   const isSmall = useIsMobile(640)

   /**
    * Automatically close the dialog if there are no events to recommend
    */
   useEffect(() => {
      if (!loading && !events?.length) {
         closeDialog()
      }
   }, [closeDialog, events?.length, loading])

   return (
      <RecommendationsContainer
         sx={{
            justifyContent: loading ? "center" : "flex-start",
         }}
      >
         <CloseButton onClick={closeDialog} />
         <AnimatePresence mode="sync">
            <motion.div key="recommendations-title" layout>
               <Title
                  variant={loading ? "desktopBrandedH2" : "desktopBrandedH5"}
               >
                  Keep your pace going!&nbsp;🔥
               </Title>
            </motion.div>
            <motion.div key="recommendations-subtitle" layout>
               <AnimatePresence mode="sync">
                  {loading ? (
                     <motion.div
                        variants={fadeAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                     >
                        <Subtitle key="recommendations-subtitle-loading">
                           Finding your next favorite streams.
                        </Subtitle>
                     </motion.div>
                  ) : (
                     <motion.div
                        variants={fadeAnimation}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                     >
                        <Subtitle key="recommendations-subtitle">
                           Because you registered to <b>{livestream.company}</b>{" "}
                           livestream:
                        </Subtitle>
                     </motion.div>
                  )}
               </AnimatePresence>
            </motion.div>
            {loading ? null : (
               <motion.div
                  key="recommendations-list"
                  layout
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideUpAnimation}
               >
                  <Grid container spacing={1.5}>
                     {events.map((event, index) => (
                        <Grid item xs={isSmall ? 12 : 6} key={event.id}>
                           <motion.div
                              variants={cardAnimation}
                              initial="initial"
                              animate="animate"
                           >
                              <EventPreviewCard
                                 totalElements={events.length}
                                 index={index}
                                 isRecommended
                                 event={event}
                                 location={
                                    ImpressionLocation.livestreamDialogPostRegistrationRecommendations
                                 }
                              />
                           </motion.div>
                        </Grid>
                     ))}
                  </Grid>
               </motion.div>
            )}
         </AnimatePresence>
      </RecommendationsContainer>
   )
}

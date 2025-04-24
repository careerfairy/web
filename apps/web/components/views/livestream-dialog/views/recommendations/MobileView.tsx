import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Container, IconButton, Stack, Typography } from "@mui/material"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { X as CloseIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLiveStreamDialog } from "../.."
import { BlurredBackground } from "./BlurredBackground"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"

const styles = sxStyles({
   title: {
      transition: (theme) => theme.transitions.create(["all"]),
      textAlign: "center",
   },
   subtitle: {
      transition: (theme) => theme.transitions.create(["all"]),
      textAlign: "center",
   },
})

// Wrap components with motion for animations
const AnimatedBlurredBackground = motion(BlurredBackground)

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
         {showRecommendations ? (
            <Recommendations key="recommendations" />
         ) : (
            <AnimatedBlurredBackground
               key="get-notified-card"
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
         <RecommendationsNav key="recommendations-nav" />
      </AnimatePresence>
   )
}

const Recommendations = () => {
   const { events, loading } = useRecommendedEvents({ bypassCache: true })
   const { livestream, closeDialog } = useLiveStreamDialog()

   useEffect(() => {
      if (!loading && !events?.length) {
         closeDialog()
      }
   }, [closeDialog, events?.length, loading])

   return (
      <Container
         sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: loading ? "center" : "flex-start",
            gap: loading ? 1.5 : 1,
            border: "1px solid red",
            pt: 6,
            flex: 1,
            position: "relative",
         }}
      >
         <IconButton
            onClick={closeDialog}
            sx={{ position: "absolute", top: 12, right: 12, padding: 0.5 }}
         >
            <CloseIcon />
         </IconButton>
         <AnimatePresence mode="sync">
            <motion.div key="recommendations-title" layout>
               <Typography
                  component={loading ? "h2" : "h5"}
                  variant={loading ? "desktopBrandedH2" : "desktopBrandedH5"}
                  sx={styles.title}
               >
                  Keep your pace going!&nbsp;🔥
               </Typography>
            </motion.div>
            <motion.div key="recommendations-subtitle" layout>
               {loading ? (
                  <Typography
                     component={"p"}
                     variant="medium"
                     sx={styles.subtitle}
                  >
                     Finding your next favorite streams.
                  </Typography>
               ) : (
                  <Typography
                     component={"p"}
                     variant="medium"
                     sx={styles.subtitle}
                  >
                     Because you registered to <b>{livestream.company}</b>{" "}
                     livestream:
                  </Typography>
               )}
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
                  <Stack spacing={1.5}>
                     {events.map((event, index) => (
                        <motion.div key={index} variants={cardAnimation}>
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
                     ))}
                  </Stack>
               </motion.div>
            )}
         </AnimatePresence>
      </Container>
   )
}

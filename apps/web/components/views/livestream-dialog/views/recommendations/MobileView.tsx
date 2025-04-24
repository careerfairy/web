import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams/livestreams"
import { Button, Container, IconButton, Stack, Typography } from "@mui/material"
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
            <Recommendations />
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
   const { events, loading } = useRecommendedEvents()
   const { livestream, closeDialog } = useLiveStreamDialog()

   console.log("🚀 ~ Recommendations ~ events:", events)

   // Create a separate simulated loading state
   const [simulatedLoading, setSimulatedLoading] = useState(true)

   useEffect(() => {
      setTimeout(() => {
         setSimulatedLoading(false)
      }, 3000)
   }, [])

   // Combine actual loading from hook with simulated loading
   const isLoading = loading || simulatedLoading

   // When reset button is clicked, set simulated loading for 2 seconds
   const handleReset = () => {
      setSimulatedLoading(true)
      setTimeout(() => {
         setSimulatedLoading(false)
      }, 3000)
   }

   return (
      <Container
         sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: isLoading ? "center" : "flex-start",
            gap: isLoading ? 1.5 : 1,
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
                  component={isLoading ? "h2" : "h5"}
                  variant={isLoading ? "desktopBrandedH2" : "desktopBrandedH5"}
                  sx={styles.title}
               >
                  Keep your pace going!&nbsp;🔥
               </Typography>
            </motion.div>
            <motion.div key="recommendations-subtitle" layout>
               {isLoading ? (
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
            {isLoading ? null : (
               <motion.div
                  key="recommendations-list"
                  layout
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideUpAnimation}
               >
                  <Stack spacing={1.5}>
                     {Array.from({ length: 10 }).map((_, index) => (
                        <motion.div key={index} variants={cardAnimation}>
                           <EventPreviewCard
                              totalElements={events.length}
                              index={index}
                              isRecommended
                              location={
                                 ImpressionLocation.livestreamDialogPostRegistrationRecommendations
                              }
                              loading
                           />
                        </motion.div>
                     ))}
                  </Stack>
               </motion.div>
            )}
            <motion.div key="recommendations-reset-button" layout>
               <Button
                  component={motion.button}
                  variant="contained"
                  onClick={handleReset}
               >
                  {isLoading ? "Loading..." : "Simulate Loading"}
               </Button>
            </motion.div>
         </AnimatePresence>
      </Container>
   )
}

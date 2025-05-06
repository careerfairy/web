import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/livestreams"
import {
   Box,
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
import { useArtificialLoading } from "./useArtificialLoading"

const MobileLayout = styled(Box)({
   minHeight: "100%",
   overflowY: "auto",
   display: "flex",
   flexDirection: "column",
})

const RecommendationsContainer = styled(Container)({
   display: "flex",
   flexDirection: "column",
   paddingTop: 40,
   position: "relative",
   height: "-webkit-fill-available",
   minHeight: "inherit",
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
   const { events, loading: loadingEvents } = useRecommendedEvents({
      bypassCache: true,
   })

   const { livestream, goToView } = useLiveStreamDialog()

   const nothingToRecommend = !loadingEvents && !events?.length

   const handleNext = () => {
      if (nothingToRecommend) {
         goToView("livestream-details")
      } else {
         setShowRecommendations(true)
      }
   }

   return (
      <MobileLayout>
         <AnimatePresence>
            {Boolean(showRecommendations) && (
               <Recommendations
                  key="recommendations"
                  events={events}
                  nothingToRecommend={nothingToRecommend}
                  loadingEvents={loadingEvents}
               />
            )}
            <RecommendationsNav key="recommendations-nav" />
            {!showRecommendations && (
               <Box
                  component={motion.div}
                  display="flex"
                  flex={1}
                  flexDirection="column"
                  key="get-notified-card"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeAnimation}
               >
                  <BlurredBackground onClick={handleNext}>
                     <GetNotifiedCard
                        livestream={livestream}
                        onClose={handleNext}
                        onClick={(e) => e.stopPropagation()} // Prevent the card from closing when clicked
                     />
                  </BlurredBackground>
               </Box>
            )}
         </AnimatePresence>
      </MobileLayout>
   )
}

const MIN_LOADING_TIME = 1500

const Recommendations = ({
   events,
   nothingToRecommend,
   loadingEvents,
}: {
   events: LivestreamEvent[]
   nothingToRecommend: boolean
   loadingEvents: boolean
}) => {
   const { livestream, closeDialog, goToView } = useLiveStreamDialog()
   const isSmall = useIsMobile(640)

   // Use our custom hook to manage loading state
   const isLoading = useArtificialLoading(loadingEvents, {
      minLoadingTime: MIN_LOADING_TIME,
      sessionKey: "cf-recommendations-loading-shown",
   })

   useEffect(() => {
      if (nothingToRecommend) {
         goToView("livestream-details")
      }
   }, [goToView, nothingToRecommend])

   return (
      <RecommendationsContainer
         sx={{
            justifyContent: isLoading ? "center" : "flex-start",
         }}
      >
         <CloseButton onClick={closeDialog} />
         <AnimatePresence mode="sync">
            <motion.div
               key="recommendations-title"
               initial="initial"
               animate="animate"
               exit="exit"
               variants={slideUpAnimation}
               layout
            >
               <Title
                  variant={isLoading ? "desktopBrandedH2" : "desktopBrandedH5"}
               >
                  Keep your pace going!&nbsp;🔥
               </Title>
            </motion.div>
            <motion.div
               key="recommendations-subtitle"
               initial="initial"
               animate="animate"
               exit="exit"
               variants={slideUpAnimation}
               layout
            >
               <AnimatePresence mode="sync">
                  {isLoading ? (
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
                           live stream:
                        </Subtitle>
                     </motion.div>
                  )}
               </AnimatePresence>
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
                  <Grid container sx={{ pb: 11 }} spacing={1.5}>
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

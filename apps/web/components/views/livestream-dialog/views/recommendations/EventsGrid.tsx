import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/livestreams"
import { Grid } from "@mui/material"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { motion } from "framer-motion"
import { ReactNode } from "react"

// Animation for individual cards
const cardAnimation = {
   initial: { opacity: 0, y: 20 },
   animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
   },
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

type Props = {
   events: LivestreamEvent[]
   singleColumn?: boolean
   loading?: boolean
}

export const EventsGrid = ({ events, singleColumn, loading }: Props) => {
   if (loading) {
      return (
         <AnimateSlideUp>
            <Grid container sx={{ pb: 11 }} spacing={1.5}>
               {Array(6)
                  .fill(null)
                  .map((_, index) => (
                     <Grid
                        item
                        xs={singleColumn ? 12 : 6}
                        key={`loading-${index}`}
                     >
                        <motion.div
                           variants={cardAnimation}
                           initial="initial"
                           animate="animate"
                        >
                           <EventPreviewCard loading />
                        </motion.div>
                     </Grid>
                  ))}
            </Grid>
         </AnimateSlideUp>
      )
   }

   return (
      <AnimateSlideUp>
         <Grid container sx={{ pb: 11 }} spacing={1.5}>
            {events.map((event, index) => (
               <Grid item xs={singleColumn ? 12 : 6} key={event.id}>
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
      </AnimateSlideUp>
   )
}

const AnimateSlideUp = ({ children }: { children: ReactNode }) => {
   return (
      <motion.div
         key="recommendations-list"
         layout
         initial="initial"
         animate="animate"
         exit="exit"
         variants={slideUpAnimation}
      >
         {children}
      </motion.div>
   )
}

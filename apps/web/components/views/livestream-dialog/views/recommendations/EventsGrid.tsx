import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams/livestreams"
import { Box, Grid, Typography, styled } from "@mui/material"
import { SlideUpWithStaggeredChildrenAnimation } from "components/util/framer-animations"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { motion } from "framer-motion"
import { ReactNode } from "react"

const cardAnimation = {
   initial: { opacity: 0, y: 20 },
   animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
   },
}

const EmptyStateContainer = styled(Box)({
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   minHeight: "150px",
   width: "100%",
   padding: "40px 24px",
})

const EmptyStateText = styled(Typography)({
   opacity: 0.8,
   textAlign: "center",
   color: "text.secondary",
})

const EventsContainer = styled(Grid)(({ theme }) => ({
   paddingBottom: theme.spacing(11),
}))

type Props = {
   events: LivestreamEvent[]
   singleColumn?: boolean
   loading?: boolean
}

export const EventsGrid = ({ events, singleColumn, loading }: Props) => {
   if (loading) {
      return (
         <AnimateSlideUp>
            <EventsContainer container spacing={1.5}>
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
            </EventsContainer>
         </AnimateSlideUp>
      )
   }

   if (events.length === 0) {
      return (
         <AnimateSlideUp>
            <EmptyStateContainer>
               <EmptyStateText>
                  No events available at the moment.
               </EmptyStateText>
            </EmptyStateContainer>
         </AnimateSlideUp>
      )
   }

   return (
      <AnimateSlideUp>
         <EventsContainer container spacing={1.5}>
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
         </EventsContainer>
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
         variants={SlideUpWithStaggeredChildrenAnimation}
      >
         {children}
      </motion.div>
   )
}

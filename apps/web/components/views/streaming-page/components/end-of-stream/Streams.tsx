import { ImpressionLocation } from "@careerfairy/shared-lib/dist/livestreams"
import { Box, Button, Skeleton } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useNextLivestreamsSWR } from "components/custom-hook/live-stream/useNextlivestreamsSWR"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import useRecommendedEvents from "components/custom-hook/useRecommendedEvents"
import Link from "components/views/common/Link"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { EndOfStreamContainer } from "./Container"
import { Heading } from "./Heading"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
   noRightPadding: {
      pr: 0,
   },
   withRightPadding: {
      pr: 2,
   },
   streamCard: {
      height: 150,
      borderRadius: 2,
      bgcolor: "red",
   },
   showCardBoxShadows: {
      pb: 0.5,
      mb: -0.5,
      px: 0.2,
      mx: -0.2,
   },
   viewAllButtonWrapper: {
      mt: 2,
   },
})

export const Streams = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const plugins = [WheelGesturesPlugin()]

const Content = () => {
   const { isLoggedIn } = useAuth()
   const streamIsMobile = useStreamIsMobile()

   const { events: recommendedEvents } = useRecommendedEvents({
      suspense: true,
      disabled: !isLoggedIn,
   })

   const { data: nextEvents } = useNextLivestreamsSWR({
      suspense: true,
      disabled: isLoggedIn,
   })

   const streams = isLoggedIn ? recommendedEvents : nextEvents
   const hasMoreThanThreeEvents = streams.length > 3

   return (
      <EndOfStreamContainer
         sx={Boolean(streamIsMobile) && styles.noRightPadding}
      >
         <Heading>Next live streams to land your dream job!</Heading>

         <ResponsiveCarousel disableSwipe={!streamIsMobile}>
            {streams.slice(0, 3).map((event, index) => (
               <EventPreviewCard
                  key={event.id}
                  index={index}
                  totalElements={streams.length}
                  location={ImpressionLocation.endOfStreamLivestreams}
                  event={event}
                  isRecommended
               />
            ))}
         </ResponsiveCarousel>
         {Boolean(hasMoreThanThreeEvents) && (
            <Box
               sx={[
                  styles.viewAllButtonWrapper,
                  streamIsMobile && styles.withRightPadding,
               ]}
            >
               <Button
                  component={Link}
                  noLinkStyle
                  variant="contained"
                  color="primary"
                  fullWidth
                  href="/next-livestreams"
               >
                  More upcoming live streams
               </Button>
            </Box>
         )}
      </EndOfStreamContainer>
   )
}

type ResponsiveCarouselProps = {
   children: ReactNode
   disableSwipe?: boolean
}
const ResponsiveCarousel = ({
   children,
   disableSwipe,
}: ResponsiveCarouselProps) => {
   const streamIsLandscape = useStreamIsLandscape()

   const streamIsMobile = useStreamIsMobile()

   return (
      <GenericCarousel
         slideWidth={
            streamIsLandscape ? "360px" : streamIsMobile ? "323px" : "33.3%"
         }
         gap={streamIsMobile ? "12px" : "16px"}
         sx={styles.showCardBoxShadows}
         plugins={plugins}
         options={{
            active: !disableSwipe,
         }}
      >
         {children}
      </GenericCarousel>
   )
}

const Loader = () => {
   return (
      <EndOfStreamContainer sx={styles.noRightPadding}>
         <Heading>
            <Skeleton width={300} />
         </Heading>
         <ResponsiveCarousel disableSwipe>
            <EventPreviewCard loading />
            <EventPreviewCard loading />
            <EventPreviewCard loading />
         </ResponsiveCarousel>
      </EndOfStreamContainer>
   )
}

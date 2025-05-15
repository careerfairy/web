import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
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
import {
   GenericCarousel,
   GenericCarouselProps,
} from "components/views/common/carousels/GenericCarousel"
import EventPreviewCard from "components/views/common/stream-cards/EventPreviewCard"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { useRouter } from "next/router"
import React from "react"
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

export const RecommendedStreams = () => {
   const { authenticatedUser } = useAuth()

   const { events: recommendedEvents } = useRecommendedEvents({
      suspense: true,
   })

   if (!authenticatedUser.isLoaded) return <Loader />

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content streams={recommendedEvents} />
      </SuspenseWithBoundary>
   )
}

export const NextStreams = () => {
   const { data: nextEvents } = useNextLivestreamsSWR({
      suspense: true,
   })

   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content streams={nextEvents} />
      </SuspenseWithBoundary>
   )
}

const plugins = [WheelGesturesPlugin()]

type ContentProps = {
   streams: LivestreamEvent[]
}

const Content = ({ streams }: ContentProps) => {
   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const streamIsMobile = useStreamIsMobile()
   const selectedLivestreamId = query.selectedLivestreamId as string | null

   const hasMoreThanThreeEvents = streams.length > 3

   const handleOpenLivestreamDialog = (event: LivestreamEvent) => {
      push(
         {
            pathname,
            query: {
               ...query,
               selectedLivestreamId: event.id,
            },
         },
         undefined,
         { shallow: true }
      )
   }

   const handleCloseLivestreamDialog = () => {
      delete query.selectedLivestreamId
      push(
         {
            pathname,
            query,
         },
         undefined,
         { shallow: true }
      )
   }

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
                  isRecommended
                  event={event}
                  onCardClick={() => {
                     handleOpenLivestreamDialog(event)
                  }}
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
         <LivestreamDialog
            open={Boolean(selectedLivestreamId)}
            livestreamId={selectedLivestreamId}
            handleClose={handleCloseLivestreamDialog}
            mode="stand-alone"
            initialPage={"details"}
            serverUserEmail={authenticatedUser?.email}
         />
      </EndOfStreamContainer>
   )
}

type ResponsiveCarouselProps = {
   children: GenericCarouselProps["children"]
   disableSwipe?: boolean
}
const ResponsiveCarousel = ({
   children,
   disableSwipe,
}: ResponsiveCarouselProps) => {
   const streamIsLandscape = useStreamIsLandscape()

   const streamIsMobile = useStreamIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         active: !disableSwipe,
      },
      plugins
   )

   const slideWidth = streamIsLandscape
      ? "360px"
      : streamIsMobile
      ? "323px"
      : "33.3%"

   return (
      <GenericCarousel
         gap={streamIsMobile ? "12px" : "16px"}
         sx={styles.showCardBoxShadows}
         emblaRef={emblaRef}
         emblaApi={emblaApi}
         preventEdgeTouch
      >
         {React.Children.map(children, (child) => (
            <GenericCarousel.Slide slideWidth={slideWidth}>
               {child}
            </GenericCarousel.Slide>
         ))}
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

import {
   ImpressionLocation,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import Box from "@mui/material/Box"
import { usePartnership } from "HOCs/PartnershipProvider"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { useIsInTalentGuide } from "components/custom-hook/utils/useIsInTalentGuide"
import { isInIframe } from "components/helperFunctions/HelperFunctions"
import { useLiveStreamDialog } from "components/views/talent-guide/blocks/live-stream/LiveStreamDialogContext"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/router"
import React, { forwardRef, useMemo } from "react"
import { useInView } from "react-intersection-observer"
import { checkIfPast } from "util/streamUtil"
import {
   buildDialogLink,
   isOnlivestreamDialogPage,
} from "../../livestream-dialog"
import { EventPreviewCardProvider } from "./EventPreviewCardContext"
import LiveStreamCard from "./LiveStreamCard"
import RecordingCard from "./RecordingCard"

export type EventPreviewCardProps = {
   event?: LivestreamEvent
   loading?: boolean
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   isRecommended?: boolean
   // The index of the event in the list
   index?: number
   // The total number of events in the list
   totalElements?: number
   location?: ImpressionLocation | string
   ref?: React.Ref<HTMLDivElement>
   bottomElement?: React.ReactNode
   // If true, the chip labels will be hidden
   hideChipLabels?: boolean
   disableClick?: boolean
   /* Overrides the default Link click behavior of the card */
   onCardClick?: (e: React.MouseEvent<HTMLElement>) => void
   selectInput?: React.ReactNode
   selected?: boolean
   disableTracking?: boolean
}

const EventPreviewCard = forwardRef<HTMLDivElement, EventPreviewCardProps>(
   (props, ref) => {
      const router = useRouter()
      const { pathname } = router

      const { inView: cardInView, ref: cardInViewRef } = useInView({
         fallbackInView: true,
      })

      const hasRegistered = useUserIsRegistered(props.event?.id, {
         disabled: !cardInView, // Helps Reduce the number of listeners
      })

      const { getPartnerEventLink } = usePartnership()

      const isPast = checkIfPast(props.event)

      const isPlaceholderEvent = props.event?.id.includes("placeholderEvent")

      const isInTalentGuidePage = useIsInTalentGuide()
      const livestreamDialogContext = useLiveStreamDialog()

      /* Allow opening of live stream dialog on talent guide context */
      const contextProps = useMemo(() => {
         return {
            onClick: () => {
               livestreamDialogContext.handleLiveStreamDialogOpen(
                  props.event.id
               )
            },
         }
      }, [props.event?.id, livestreamDialogContext])

      const presenterEvent = useMemo(
         () =>
            props.event
               ? LivestreamPresenter.createFromDocument(props.event)
               : null,
         [props.event]
      )

      const linkProps = useMemo<LinkProps>(() => {
         if (!presenterEvent?.id) {
            return {
               href: "",
            }
         }

         // If the application is running in an iframe, open the link in a new tab with UTM tags
         if (isInIframe()) {
            return {
               href: getPartnerEventLink(presenterEvent.id),
               target: "_blank",
            }
         }

         if (presenterEvent.isLive() && hasRegistered) {
            return {
               href: presenterEvent.getViewerEventRoomLink(),
            }
         }

         const eventLink = buildDialogLink({
            router,
            link: {
               type: "livestreamDetails",
               livestreamId: presenterEvent.id,
            },
         })

         // Fall back to the default portal link and open the event in a new tab
         return {
            href: eventLink,
            target: isOnlivestreamDialogPage(pathname) ? undefined : "_blank",
         }
      }, [presenterEvent, hasRegistered, router, pathname, getPartnerEventLink])

      const isLink =
         !isInTalentGuidePage &&
         props.event &&
         !props.onCardClick &&
         !isPlaceholderEvent

      if (isLink) {
         return (
            <Box
               display="flex"
               component={Link}
               {...linkProps}
               shallow
               scroll={false}
            >
               <EventPreviewCardProvider
                  {...props}
                  livestream={props.event}
                  isPlaceholderEvent={isPlaceholderEvent}
                  hasRegistered={hasRegistered}
                  cardInView={cardInView}
                  cardInViewRef={cardInViewRef}
                  isPast={isPast}
               >
                  {isPast ? (
                     <RecordingCard {...props} ref={ref} />
                  ) : (
                     <LiveStreamCard {...props} ref={ref} />
                  )}
               </EventPreviewCardProvider>
            </Box>
         )
      }

      return (
         <Box {...(isInTalentGuidePage && contextProps)}>
            <EventPreviewCardProvider
               {...props}
               livestream={props.event}
               isPlaceholderEvent={isPlaceholderEvent}
               hasRegistered={hasRegistered}
               cardInView={cardInView}
               cardInViewRef={cardInViewRef}
               isPast={isPast}
            >
               {isPast ? (
                  <RecordingCard {...props} ref={ref} />
               ) : (
                  <LiveStreamCard {...props} ref={ref} />
               )}
            </EventPreviewCardProvider>
         </Box>
      )
   }
)

EventPreviewCard.displayName = "EventPreviewCard"

export default EventPreviewCard

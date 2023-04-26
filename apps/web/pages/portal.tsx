import React, { useEffect, useMemo, useState } from "react"
import HighlightsCarousel from "../components/views/portal/HighlightsCarousel"
import Container from "@mui/material/Container"
import RecommendedEvents from "../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper"
import { useAuth } from "../HOCs/AuthProvider"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import SEO from "../components/util/SEO"
import { highlightRepo, livestreamRepo } from "../data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "../data/constants/streamContants"
import EventsPreview, {
   EventsTypes,
} from "../components/views/portal/events-preview/EventsPreview"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import nookies from "nookies"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import RecordedEventsCarousel from "../components/views/portal/recorded-events/RecordedEventsCarousel"
import DateUtil from "../util/DateUtil"
import CookiesUtil from "../util/CookiesUtil"
import { Box } from "@mui/material"
import { mapFromServerSide } from "util/serverUtil"
import GenericDashboardLayout from "../layouts/GenericDashboardLayout"
import useScrollTrigger from "@mui/material/useScrollTrigger"

const PortalPage = ({
   highlights,
   comingUpNextEvents,
   showHighlights,
   pastEvents,
   recordedEvents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()
   const isScrollingHoverTheBanner = useScrollTrigger({
      threshold: 250,
      disableHysteresis: true,
   })

   // To have a different look & feel on header and topBar when hovering the portal page banner
   const [isOverBanner, setIsOverBanner] = useState<boolean>(
      recordedEvents?.length > 0
   )

   useEffect(() => {
      if (recordedEvents?.length > 0) {
         setIsOverBanner(!isScrollingHoverTheBanner)
      }
   }, [isScrollingHoverTheBanner])

   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )
   const events = useMemo(() => mapFromServerSide(pastEvents), [pastEvents])
   const comingUpNext = useMemo(
      () => mapFromServerSide(comingUpNextEvents),
      [comingUpNextEvents]
   )

   return (
      <>
         <SEO
            id={"CareerFairy | Portal"}
            description={
               "To find the greatest virtual career events, use the CareerFairy Portal. Through our events, meet potential future colleagues live and land your dream job!"
            }
            title={"CareerFairy | Portal"}
         />
         <GenericDashboardLayout
            pageDisplayName={""}
            hasRecordings={recordedEvents?.length > 0}
            isPortalPage={true}
            isOverPortalBanner={isOverBanner}
         >
            <>
               {recordedEvents?.length > 0 && (
                  <Box mb={4}>
                     <RecordedEventsCarousel
                        livestreams={mapFromServerSide(recordedEvents)}
                     />
                  </Box>
               )}
               <Container disableGutters>
                  <WidgetsWrapper>
                     {recordedEvents?.length === 0 && (
                        <HighlightsCarousel
                           showHighlights={showHighlights}
                           serverSideHighlights={highlights}
                        />
                     )}
                     {hasInterests ? <RecommendedEvents limit={10} /> : null}
                     <ComingUpNextEvents
                        serverSideEvents={comingUpNext}
                        limit={20}
                     />
                     <MyNextEvents limit={20} />
                     <EventsPreview
                        id={"past-events"}
                        title={"PAST EVENTS"}
                        type={EventsTypes.pastEvents}
                        events={events}
                        seeMoreLink={"/next-livestreams?type=pastEvents"}
                        // No need to show loading as these events have already been queried server side
                        loading={false}
                     />
                  </WidgetsWrapper>
               </Container>
            </>
         </GenericDashboardLayout>
      </>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const cookies = nookies.get(ctx)

   let token: { email: string } | null = null
   try {
      token = CookiesUtil.parseJwt({
         token: cookies.token,
         isServerSide: true,
      })
   } catch (e) {
      console.error("Failed to parse cookie.token", e, cookies.token)
   }

   const todayLess5Days = DateUtil.addDaysToDate(new Date(), -5)

   const promises = []
   promises.push(
      highlightRepo.shouldShowHighlightsCarousel(),
      highlightRepo.getHighlights(5),
      livestreamRepo.getUpcomingEvents(20),
      livestreamRepo.getPastEventsFrom({
         fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
         limit: 6,
      })
   )

   // only adds recording request if token has email
   if (token?.email) {
      promises.push(
         livestreamRepo.getRecordedEventsByUserId(token?.email, todayLess5Days)
      )
   }
   const results = await Promise.allSettled(promises)

   const [
      showHighlights,
      highlights,
      comingUpNextEvents,
      pastEvents,
      recordedEvents,
   ] = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value)

   const recordedEventsToShare = recordedEvents?.filter(
      (event: LivestreamEvent) => Boolean(event?.denyRecordingAccess) === false
   )

   return {
      props: {
         showHighlights,
         ...(highlights && { highlights }),
         ...(comingUpNextEvents && {
            comingUpNextEvents: comingUpNextEvents.map(
               LivestreamPresenter.serializeDocument
            ),
         }),
         ...(pastEvents && {
            pastEvents: pastEvents.map(LivestreamPresenter.serializeDocument),
         }),
         recordedEvents:
            recordedEventsToShare?.map(LivestreamPresenter.serializeDocument) ||
            [],
      },
   }
}

export default PortalPage

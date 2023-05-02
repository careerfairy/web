import React, { useEffect, useMemo, useState } from "react"
import Container from "@mui/material/Container"
import RecommendedEvents from "../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../components/views/portal/WidgetsWrapper"
import { useAuth } from "../HOCs/AuthProvider"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import SEO from "../components/util/SEO"
import { livestreamRepo } from "../data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "../data/constants/streamContants"
import EventsPreview, {
   EventsTypes,
} from "../components/views/portal/events-preview/EventsPreview"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import ContentCarousel from "../components/views/portal/content-carousel/ContentCarousel"
import DateUtil from "../util/DateUtil"
import { Box } from "@mui/material"
import GenericDashboardLayout from "../layouts/GenericDashboardLayout"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import { getUserTokenFromCookie, mapFromServerSide } from "util/serverUtil"

const PortalPage = ({
   comingUpNextEvents,
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
   const registeredRecordedLivestreamsForUser = useMemo(
      () => mapFromServerSide(recordedEvents),
      [recordedEvents]
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
               <Box position="relative" mb={4}>
                  <ContentCarousel
                     pastLivestreams={events}
                     upcomingLivestreams={comingUpNext}
                     registeredRecordedLivestreamsForUser={
                        registeredRecordedLivestreamsForUser
                     }
                  />
               </Box>
               <Container disableGutters>
                  <WidgetsWrapper>
                     {/*{recordedEvents?.length === 0 && (*/}
                     {/*   <HighlightsCarousel*/}
                     {/*      showHighlights={showHighlights}*/}
                     {/*      serverSideHighlights={highlights}*/}
                     {/*   />*/}
                     {/*)}*/}
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
   const token = getUserTokenFromCookie(ctx)

   const todayLess5Days = DateUtil.addDaysToDate(new Date(), -5)

   const promises = []
   promises.push(
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

   const [comingUpNextEvents, pastEvents, recordedEvents] = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => (result as PromiseFulfilledResult<any>).value)

   const recordedEventsToShare = recordedEvents?.filter(
      (event: LivestreamEvent) => Boolean(event?.denyRecordingAccess) === false
   )

   return {
      props: {
         ...(comingUpNextEvents && {
            comingUpNextEvents: comingUpNextEvents.map(
               LivestreamPresenter.serializeDocument
            ),
         }),
         ...(pastEvents && {
            pastEvents: pastEvents.map(LivestreamPresenter.serializeDocument),
         }),
         ...(recordedEventsToShare && {
            recordedEvents: recordedEventsToShare?.map(
               LivestreamPresenter.serializeDocument
            ),
         }),
      },
   }
}

export default PortalPage

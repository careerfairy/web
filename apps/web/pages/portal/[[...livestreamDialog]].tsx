import React, { useMemo } from "react"
import { useRouter } from "next/router"
import Container from "@mui/material/Container"
import RecommendedEvents from "../../components/views/portal/events-preview/RecommendedEvents"
import ComingUpNextEvents from "../../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../../components/views/portal/events-preview/MyNextEvents"
import WidgetsWrapper from "../../components/views/portal/WidgetsWrapper"
import { useAuth } from "../../HOCs/AuthProvider"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import SEO from "../../components/util/SEO"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "../../data/constants/streamContants"
import EventsPreview, {
   EventsTypes,
} from "../../components/views/portal/events-preview/EventsPreview"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import ContentCarousel from "../../components/views/portal/content-carousel/ContentCarousel"
import DateUtil from "../../util/DateUtil"
import { Box } from "@mui/material"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import {
   getServerSideUserData,
   getServerSideUserStats,
   getUserTokenFromCookie,
   mapFromServerSide,
} from "../../util/serverUtil"
import CarouselContentService, {
   type CarouselContent,
} from "../../components/views/portal/content-carousel/CarouselContentService"

import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../components/views/livestream-dialog"
import { WelcomeDialogContainer } from "../../components/views/welcome-dialog/WelcomeDialogContainer"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import Heading from "components/views/portal/common/Heading"

const PortalPage = ({
   comingUpNextEvents,
   pastEvents,
   serializedCarouselContent,
   serverUserStats,
   livestreamDialogData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()
   const router = useRouter()

   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )

   const events = useMemo(() => mapFromServerSide(pastEvents), [pastEvents])

   const comingUpNext = useMemo(
      () => mapFromServerSide(comingUpNextEvents),
      [comingUpNextEvents]
   )

   const carouselContent = useMemo<CarouselContent[]>(() => {
      return CarouselContentService.deserializeContent(
         serializedCarouselContent
      )
   }, [serializedCarouselContent])

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return
      return router.push(`/sparks/${spark.id}`)
   }

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
            topBarFixed={carouselContent?.length > 0}
            headerScrollThreshold={carouselContent?.length ? 250 : 10}
         >
            <>
               <LivestreamDialogLayout
                  livestreamDialogData={livestreamDialogData}
               >
                  <>
                     <Box position="relative" mb={4}>
                        <ContentCarousel
                           content={carouselContent}
                           serverUserStats={serverUserStats}
                        />
                     </Box>
                     <Container disableGutters>
                        <WidgetsWrapper>
                           <SparksCarouselWithSuspenseComponent
                              header={<Heading>SPARKS</Heading>}
                              handleSparksClicked={handleSparksClicked}
                           />
                           {hasInterests ? (
                              <RecommendedEvents limit={10} />
                           ) : null}
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
               </LivestreamDialogLayout>
               <WelcomeDialogContainer />
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
      }),
      getLivestreamDialogData(ctx)
   )

   // only adds recording request if token has email
   if (token?.email) {
      promises.push(
         livestreamRepo.getRecordedEventsByUserId(token?.email, todayLess5Days),
         getServerSideUserStats(token.email),
         getServerSideUserData(token.email)
      )
   }

   const results = await Promise.allSettled(promises)

   const [
      comingUpNextEvents,
      pastEvents,
      livestreamDialogData,
      recordedEvents,
      userStats,
      userData,
   ] = results.map((result) =>
      result.status === "fulfilled"
         ? (result as PromiseFulfilledResult<any>).value
         : null
   )

   const recordedEventsToShare = recordedEvents?.filter(
      (event: LivestreamEvent) => Boolean(event?.denyRecordingAccess) === false
   )

   const carouselContentService = new CarouselContentService({
      userData: userData,
      userStats: userStats,
      pastLivestreams: pastEvents || [],
      upcomingLivestreams: comingUpNextEvents || [],
      registeredRecordedLivestreamsForUser: recordedEventsToShare || [],
   })

   const carouselContent = await carouselContentService.getCarouselContent()

   return {
      props: {
         serverUserStats: userStats || null,
         ...(comingUpNextEvents && {
            comingUpNextEvents: comingUpNextEvents.map(
               LivestreamPresenter.serializeDocument
            ),
         }),
         ...(pastEvents && {
            pastEvents: pastEvents.map(LivestreamPresenter.serializeDocument),
         }),
         ...(carouselContent && {
            serializedCarouselContent:
               CarouselContentService.serializeContent(carouselContent),
         }),
         livestreamDialogData,
      },
   }
}

export default PortalPage

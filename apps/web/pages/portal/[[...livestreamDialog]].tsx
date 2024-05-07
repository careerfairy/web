import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Box } from "@mui/material"
import Container from "@mui/material/Container"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"
import { useMemo } from "react"
import SEO from "../../components/util/SEO"
import CarouselContentService, {
   type CarouselContent,
} from "../../components/views/portal/content-carousel/CarouselContentService"
import ContentCarousel from "../../components/views/portal/content-carousel/ContentCarousel"
import ComingUpNextEvents from "../../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../../components/views/portal/events-preview/MyNextEvents"
import RecommendedEvents from "../../components/views/portal/events-preview/RecommendedEvents"
import WidgetsWrapper from "../../components/views/portal/WidgetsWrapper"
import { START_DATE_FOR_REPORTED_EVENTS } from "../../data/constants/streamContants"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { useAuth } from "../../HOCs/AuthProvider"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import DateUtil from "../../util/DateUtil"
import {
   getServerSideUserData,
   getServerSideUserStats,
   getUserTokenFromCookie,
   mapFromServerSide,
} from "../../util/serverUtil"

import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import useUserSeenSparks from "components/custom-hook/spark/useUserSeenSparks"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import Heading from "components/views/portal/common/Heading"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { sxStyles } from "types/commonTypes"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../components/views/livestream-dialog"
import { WelcomeDialogContainer } from "../../components/views/welcome-dialog/WelcomeDialogContainer"

const styles = sxStyles({
   sparksCarouselHeader: {
      pr: 2,
   },
})

const PortalPage = ({
   comingUpNextEvents,
   pastEvents,
   recordedEventsToShare,
   serializedCarouselContent,
   serverUserStats,
   livestreamDialogData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()

   const router = useRouter()
   const isMobile = useIsMobile()

   console.log(
      "🚀 ~ userData.id, authenticatedUser.email:",
      authenticatedUser.email
   )

   const { sparks: seenSparks } = useUserSeenSparks()
   // const { jobApplications  } =
   //    useUserCustomJobApplications()

   // const { events: interactedEvents } = useInteractedLivestreams()
   console.log("🚀 ~ watchedSparks: ", seenSparks)
   // console.log(
   //    "🚀 ~ jobApplications: ",
   //    jobApplications
   // )
   // console.log("🚀 ~ interactedEvents:", interactedEvents)

   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )

   const events = useMemo(() => mapFromServerSide(pastEvents), [pastEvents])

   const comingUpNext = useMemo(
      () => mapFromServerSide(comingUpNextEvents),
      [comingUpNextEvents]
   )

   const carouselContentService = new CarouselContentService({
      userData: userData,
      userStats: serverUserStats,
      pastLivestreams: pastEvents || [],
      upcomingLivestreams: comingUpNextEvents || [],
      registeredRecordedLivestreamsForUser: recordedEventsToShare || [],
      watchedSparks: seenSparks || [],
      // watchedLivestreams: [],
      // watchedSparks: [],
      // appliedJobs: []
   })
   console.log("🚀 ~ carouselContentService:", carouselContentService)

   const carouselContent = useMemo<CarouselContent[]>(() => {
      return CarouselContentService.deserializeContent(
         serializedCarouselContent
      )
   }, [serializedCarouselContent])

   const handleSparksClicked = (spark: Spark) => {
      if (!spark) return

      return router.push({
         pathname: `/sparks/${spark.id}`,
         query: {
            ...router.query, // spread current query params
            interactionSource: SparkInteractionSources.Portal,
         },
      })
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
            isPortalPage={true}
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
                              headerSx={styles.sparksCarouselHeader}
                              handleSparksClicked={handleSparksClicked}
                              showArrows={!isMobile}
                           />
                           {hasInterests ? (
                              <RecommendedEvents limit={10} />
                           ) : null}
                           <ComingUpNextEvents
                              serverSideEvents={comingUpNext}
                              limit={20}
                           />
                           <MyNextEvents limit={20} />
                           <ConditionalWrapper
                              condition={Boolean(events?.length)}
                           >
                              <EventsPreviewCarousel
                                 id={"past-events"}
                                 title={"Past live streams"}
                                 type={EventsTypes.PAST_EVENTS}
                                 events={events}
                                 seeMoreLink={"/past-livestreams"}
                              />
                           </ConditionalWrapper>
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
         // livestreamRepo.getUserSeenEventsByUserId(token?.email),
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
      result.status === "fulfilled" ? result.value : null
   )

   const recordedEventsToShare = recordedEvents?.filter(
      (event: LivestreamEvent) => Boolean(event?.denyRecordingAccess) === false
   )

   // TODO: Move to client
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
         ...(recordedEventsToShare && {
            recordedEventsToShare: recordedEventsToShare.map(
               LivestreamPresenter.serializeDocument
            ),
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

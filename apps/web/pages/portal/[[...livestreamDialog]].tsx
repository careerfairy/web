import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Box, Typography } from "@mui/material"
import Container from "@mui/material/Container"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import SEO from "../../components/util/SEO"
import CarouselContentService, {
   filterNonRegisteredStreams,
   type CarouselContent,
} from "../../components/views/portal/content-carousel/CarouselContentService"
import ContentCarousel from "../../components/views/portal/content-carousel/ContentCarousel"
import ComingUpNextEvents from "../../components/views/portal/events-preview/ComingUpNextEvents"
import MyNextEvents from "../../components/views/portal/events-preview/MyNextEvents"
import RecommendedEvents from "../../components/views/portal/events-preview/RecommendedEvents"
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

import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { useAvailableTagsByHits } from "components/custom-hook/tags/useAvailableTagsByHits"
import { useIsMounted } from "components/custom-hook/utils/useIsMounted"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import CategoryTagsContent from "components/views/common/tags/CategoryTagsContent"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import EventsPreviewCarousel, {
   EventsTypes,
} from "components/views/portal/events-preview/EventsPreviewCarousel"
import { FallbackComponent } from "components/views/portal/sparks/FallbackComponent"
import { UserSparksCarousel } from "components/views/portal/sparks/UserSparksCarousel"
import TagsCarouselWithArrow from "components/views/tags/TagsCarouselWithArrow"
import dynamic from "next/dynamic"
import { sxStyles } from "types/commonTypes"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../components/views/livestream-dialog"
import { WelcomeDialogContainer } from "../../components/views/welcome-dialog/WelcomeDialogContainer"

const styles = sxStyles({
   sparksCarousel: {
      mb: 4,
      ml: 2,
   },
   sparksCarouselHeader: {
      mr: 2,
   },
})

const DIALOG_SOURCE = "livestreamDialog"

const RecommendedCustomJobs = dynamic(
   () =>
      import(
         "../../components/views/jobs/components/custom-jobs/RecommendedCustomJobs"
      ),
   {
      ssr: false,
   }
)

const PortalPage = ({
   comingUpNextEvents,
   pastEvents,
   serializedCarouselContent,
   serverUserStats,
   livestreamDialogData,
   customJobDialogData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()
   const router = useRouter()
   const isMounted = useIsMounted()

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
         <GenericDashboardLayout pageDisplayName={""} isPortalPage={true}>
            <>
               <LivestreamDialogLayout
                  livestreamDialogData={livestreamDialogData}
               >
                  <CustomJobDialogLayout
                     customJobDialogData={customJobDialogData}
                     source={{
                        source: CustomJobApplicationSourceTypes.Portal,
                        id: CustomJobApplicationSourceTypes.Portal,
                     }}
                     dialogSource={DIALOG_SOURCE}
                  >
                     <>
                        <Container disableGutters sx={{ overflow: "hidden" }}>
                           <ContentCarousel
                              content={carouselContent}
                              serverUserStats={serverUserStats}
                           />
                        </Container>
                        <Container disableGutters>
                           <PortalTagsContent>
                              {isMounted ? (
                                 <SuspenseWithBoundary
                                    fallback={<SparksLoadingFallback />}
                                 >
                                    <UserSparksCarousel
                                       header={
                                          <Typography
                                             variant="brandedH4"
                                             color="neutral.800"
                                             fontWeight="600"
                                          >
                                             Sparks
                                          </Typography>
                                       }
                                       handleSparksClicked={handleSparksClicked}
                                       containerSx={styles.sparksCarousel}
                                       headerSx={styles.sparksCarouselHeader}
                                    />
                                 </SuspenseWithBoundary>
                              ) : (
                                 <SparksLoadingFallback />
                              )}
                              {hasInterests ? (
                                 <RecommendedEvents limit={10} />
                              ) : null}
                              <ComingUpNextEvents
                                 serverSideEvents={comingUpNext}
                                 limit={20}
                              />
                              <RecommendedCustomJobs />
                              <MyNextEvents />
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
                           </PortalTagsContent>
                        </Container>
                     </>
                  </CustomJobDialogLayout>
               </LivestreamDialogLayout>
               <WelcomeDialogContainer />
            </>
         </GenericDashboardLayout>
      </>
   )
}

const SparksLoadingFallback = () => {
   return (
      <FallbackComponent
         sx={styles.sparksCarousel}
         header={
            <Typography
               variant="brandedH4"
               color="neutral.800"
               fontWeight="600"
            >
               Sparks
            </Typography>
         }
      />
   )
}

type PortalTagsContentProps = {
   children: React.ReactNode
}
const PortalTagsContent = ({ children }: PortalTagsContentProps) => {
   const isMounted = useIsMounted()
   return (
      <SuspenseWithBoundary fallback={children}>
         {isMounted ? <PortalTags>{children}</PortalTags> : children}
      </SuspenseWithBoundary>
   )
}

const PortalTags = ({ children }: PortalTagsContentProps) => {
   const availableCategories = useAvailableTagsByHits()
   const defaultCategories = availableCategories.map((tag) => {
      return [
         tag.id,
         {
            selected: false,
         },
      ]
   })

   const [categoriesData, setCategoriesData] = useState(() => {
      return Object.fromEntries(defaultCategories)
   })

   const selectedCategories = useMemo(() => {
      return Object.keys(categoriesData).filter(
         (cat) => categoriesData[cat].selected
      )
   }, [categoriesData])

   const handleCategoryChipClicked = (categoryId: string) => {
      const newCategories = Object.fromEntries(
         Object.keys(categoriesData).map((id) => {
            return [
               id,
               {
                  selected:
                     id === categoryId
                        ? !categoriesData[categoryId].selected
                        : false,
               },
            ]
         })
      )

      setCategoriesData(newCategories)
   }

   return (
      <Box sx={{ mb: 3, minHeight: "100vh" }}>
         <TagsCarouselWithArrow
            selectedCategories={selectedCategories}
            tags={availableCategories}
            handleTagClicked={handleCategoryChipClicked}
            handleAllClicked={() => handleCategoryChipClicked(undefined)}
         />
         {selectedCategories.length ? (
            <CategoryTagsContent categories={categoriesData} />
         ) : (
            children
         )}
      </Box>
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
      result.status === "fulfilled" ? result.value : null
   )

   const recordedEventsToShare = recordedEvents?.filter(
      (event: LivestreamEvent) => Boolean(event?.denyRecordingAccess) === false
   )

   const [upcomingLivestreams, pastLivestreams, customJobDialogData] =
      await Promise.all([
         filterNonRegisteredStreams(comingUpNextEvents || [], token?.email),
         filterNonRegisteredStreams(pastEvents || [], token?.email),
         getCustomJobDialogData(ctx, DIALOG_SOURCE),
      ])

   const carouselContentService = new CarouselContentService({
      userData: userData,
      userStats: userStats,
      pastLivestreams,
      upcomingLivestreams,
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
         customJobDialogData,
         livestreamDialogData,
      },
   }
}

export default PortalPage

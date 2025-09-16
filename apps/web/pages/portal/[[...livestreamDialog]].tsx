import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Box, Typography } from "@mui/material"
import Container from "@mui/material/Container"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { Fragment, ReactNode, useMemo, useState } from "react"
import SEO from "../../components/util/SEO"
import ComingUpNextEvents from "../../components/views/portal/events-preview/ComingUpNextEvents"
import { START_DATE_FOR_REPORTED_EVENTS } from "../../data/constants/streamContants"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { useAuth } from "../../HOCs/AuthProvider"
import GenericDashboardLayout from "../../layouts/GenericDashboardLayout"
import { mapFromServerSide } from "../../util/serverUtil"

import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { useAvailableTagsByHits } from "components/custom-hook/tags/useAvailableTagsByHits"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import CategoryTagsContent from "components/views/common/tags/CategoryTagsContent"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import EventsPreviewCarousel from "components/views/portal/events-preview/EventsPreviewCarousel"
import {
   OFFLINE_EVENT_DIALOG_KEY,
   OfflineEventDialog,
} from "components/views/portal/offline-events/OfflineEventDialog"
import { OfflineEvents } from "components/views/portal/offline-events/OfflineEvents"
import { SparksLoadingFallback } from "components/views/portal/sparks/SparksLoadingFallback"
import { SearchProvider } from "components/views/search/SearchContext"
import { SearchField } from "components/views/search/SearchField"
import { TagsCarouselSkeleton } from "components/views/tags/TagsCarouselSkeleton"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { sxStyles } from "types/commonTypes"
import {
   deserializeDocument,
   SerializedDocument,
   serializeDocument,
} from "util/firebaseSerializer"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../components/views/livestream-dialog"

const TagsCarouselWithArrow = dynamic(
   () =>
      import("components/views/tags/TagsCarouselWithArrow").then((mod) => ({
         default: mod.default,
      })),
   {
      ssr: false,
      loading: () => <TagsCarouselSkeleton />,
   }
)

const RecommendedCustomJobs = dynamic(
   () =>
      import(
         "../../components/views/jobs/components/custom-jobs/RecommendedCustomJobs"
      ).then((mod) => ({ default: mod.RecommendedCustomJobs })),
   {
      ssr: false,
   }
)

const FeaturedCompanies = dynamic(
   () =>
      import(
         "components/views/portal/companies/featured/FeaturedCompanies"
      ).then((mod) => ({ default: mod.FeaturedCompanies })),
   {
      ssr: false,
   }
)

const UserSparksCarousel = dynamic(
   () =>
      import("components/views/portal/sparks/UserSparksCarousel").then(
         (mod) => ({ default: mod.UserSparksCarousel })
      ),
   {
      ssr: false,
      loading: () => <SparksLoadingFallback />,
   }
)

const RecommendedEvents = dynamic(
   () =>
      import("../../components/views/portal/events-preview/RecommendedEvents"),
   {
      ssr: false,
   }
)

const WelcomeDialogContainer = dynamic(
   () =>
      import(
         "../../components/views/welcome-dialog/WelcomeDialogContainer"
      ).then((mod) => ({ default: mod.WelcomeDialogContainer })),
   {
      ssr: false,
   }
)

const UpcomingPanelEvents = dynamic(
   () =>
      import("../../components/views/panels/UpcomingPanelEvents").then(
         (mod) => ({ default: mod.UpcomingPanelEvents })
      ),
   {
      ssr: false,
   }
)

const styles = sxStyles({
   welcomeTextContainer: {
      ml: 2,
      pb: 2,
      mt: {
         xs: 2,
         md: 0,
      },
   },
})

const DIALOG_SOURCE = "livestreamDialog"

const PortalPage = ({
   comingUpNextEvents,
   pastEvents,
   livestreamDialogData,
   userCountryCode,
   customJobDialogData,
   serializedOfflineEvent,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { authenticatedUser, userData } = useAuth()
   const router = useRouter()
   const isMobile = useIsMobile()

   const hasInterests = Boolean(
      authenticatedUser.email || userData?.interestsIds
   )

   const events = useMemo(() => mapFromServerSide(pastEvents), [pastEvents])

   const comingUpNext = useMemo(
      () => mapFromServerSide(comingUpNextEvents),
      [comingUpNextEvents]
   )

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
      <Fragment>
         <SEO
            id={"CareerFairy | Portal"}
            description={
               "To find the greatest virtual career events, use the CareerFairy Portal. Through our events, meet potential future colleagues live and land your dream job!"
            }
            title={"CareerFairy | Portal"}
         />
         <GenericDashboardLayout
            pageDisplayName={""}
            isPortalPage={true}
            bgColor="#FAFAFE linear-gradient(180deg, #2ABAA50F 274px, #F7F8FC0F 400px)"
            headerType="fixed"
            blurHeaderOnScroll
            headerScrollThreshold={20}
         >
            <Fragment>
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
                     <Container disableGutters sx={{ mt: isMobile ? 7 : 2.5 }}>
                        <Box sx={styles.welcomeTextContainer}>
                           <Typography
                              variant="brandedH4"
                              color="neutral.900"
                              fontWeight={700}
                           >
                              {userData?.firstName
                                 ? `Welcome, ${userData?.firstName}!`
                                 : "Nice to see you!"}
                           </Typography>
                        </Box>

                        <SearchProvider>
                           <SearchField />
                        </SearchProvider>

                        <PortalTags>
                           {hasInterests ? (
                              <RecommendedEvents
                                 title="Live streams"
                                 limit={10}
                              />
                           ) : (
                              <ComingUpNextEvents
                                 title="Live streams"
                                 serverSideEvents={comingUpNext}
                                 limit={20}
                              />
                           )}
                           <UpcomingPanelEvents
                              userCountryCode={userCountryCode}
                           />
                           <RecommendedCustomJobs
                              userCountryCode={userCountryCode}
                           />
                           {userCountryCode?.toUpperCase() === "DE" && (
                              <OfflineEvents />
                           )}
                           <FeaturedCompanies />

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
                           />
                           <ConditionalWrapper
                              condition={Boolean(events?.length)}
                           >
                              <EventsPreviewCarousel
                                 id={"past-events"}
                                 title={"Recordings"}
                                 location={"portal-past-livestreams-carousel"}
                                 disableAutoPlay
                                 events={events}
                                 seeMoreLink={"/past-livestreams"}
                                 preventPaddingSlide
                              />
                           </ConditionalWrapper>
                        </PortalTags>
                     </Container>
                  </CustomJobDialogLayout>
               </LivestreamDialogLayout>
               <WelcomeDialogContainer />
            </Fragment>
         </GenericDashboardLayout>
         <OfflineEventDialog
            eventFromServer={deserializeDocument(
               serializedOfflineEvent as SerializedDocument<OfflineEvent>
            )}
         />
      </Fragment>
   )
}

type PortalTagsContentProps = {
   children: ReactNode
}

type CategoryId = string | undefined

const PortalTags = ({ children }: PortalTagsContentProps) => {
   const { tags, isLoading } = useAvailableTagsByHits()
   const [selectedCategoryId, setSelectedCategoryId] =
      useState<CategoryId>(undefined)

   const handleCategoryChipClicked = (categoryId: CategoryId) => {
      setSelectedCategoryId((previousCategoryId) =>
         previousCategoryId === categoryId ? undefined : categoryId
      )
   }

   return (
      <Box sx={{ mb: 3, mt: 1.5, minHeight: "100vh" }}>
         <TagsCarouselWithArrow
            selectedCategories={selectedCategoryId ? [selectedCategoryId] : []}
            tags={tags}
            isLoading={isLoading}
            handleTagClicked={handleCategoryChipClicked}
            handleAllClicked={() => handleCategoryChipClicked(undefined)}
         />
         {selectedCategoryId ? (
            <CategoryTagsContent
               categories={{ [selectedCategoryId]: { selected: true } }}
            />
         ) : (
            children
         )}
      </Box>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const userCountryCode =
      (ctx.req.headers["x-vercel-ip-country"] as string) || null

   const offlineEventId = ctx.query[OFFLINE_EVENT_DIALOG_KEY] as string

   const promises = []

   promises.push(
      livestreamRepo.getUpcomingEvents(20),
      livestreamRepo.getPastEventsFrom({
         fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
         limit: 6,
      }),
      getLivestreamDialogData(ctx),
      getCustomJobDialogData(ctx, DIALOG_SOURCE),
      offlineEventService.getById(offlineEventId)
   )

   const results = await Promise.allSettled(promises)

   const [
      comingUpNextEvents,
      pastEvents,
      livestreamDialogData,
      customJobDialogData,
      offlineEventData,
   ] = results.map((result) =>
      result.status === "fulfilled" ? result.value : null
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

         customJobDialogData,
         livestreamDialogData,
         userCountryCode,
         serializedOfflineEvent: serializeDocument(offlineEventData),
      },
   }
}

export default PortalPage

import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Stack } from "@mui/material"
import {
   HeroSectionEngineering,
   ParticipatingCompaniesSectionEngineering,
   RecordingsSectionEngineering,
   RegisterNowSectionEngineering,
   SpeakersSectionEngineering,
   WhosThisForSectionEngineering,
} from "components/views/engineering/page"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { NotForYouSection } from "components/views/panels/page"
import { groupRepo, livestreamRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { GetStaticProps } from "next"
import { useRouter } from "next/router"
import { useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { deserializeGroupClient, mapFromServerSide } from "util/serverUtil"

const CF_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"

const styles = sxStyles({
   pageContainer: {
      backgroundColor: (theme) => theme.brand.white[100],
      borderRadius: { xs: "20px", md: "24px" },
      p: { xs: 2, md: 4 },
      gap: { xs: 8, md: 4 },
      maxWidth: "1280px",
      width: "100%",
      alignSelf: "center",
   },
})

type EngineeringPageProps = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideEngineeringRecordings: any[]
}

export default function EngineeringPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
   serverSideEngineeringRecordings,
}: EngineeringPageProps) {
   const deserializedPanelEvents = mapFromServerSide(serverSidePanelEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const deserializedEngineeringRecordings = mapFromServerSide(
      serverSideEngineeringRecordings
   )
   const companies = serverSideCompanies.map((company) =>
      deserializeGroupClient(company)
   )

   const shuffledSpeakers = useMemo(() => {
      return (
         deserializedPanelEvents
            .flatMap((panel) => panel.speakers || [])
            // .sort(() => Math.random() - 0.5) // Randomize order
            .slice(0, 6)
      ) // Limit to 6 speakers
   }, [deserializedPanelEvents])

   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const [selectedId, setSelectedId] = useState<string | null>(
      (query.selectedPanelId as string | null) ||
         (query.selectedLivestreamId as string | null)
   )

   const handleOpenLivestreamDialog = useCallback(
      (livestreamId: string) => {
         setSelectedId(livestreamId)
         void push(
            {
               pathname: pathname,
               query: {
                  ...query,
                  selectedLivestreamId: livestreamId,
                  originSource: "Engineering_Overview_Page",
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [query, push, pathname]
   )

   const handleCloseLivestreamDialog = useCallback(() => {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
         selectedPanelId: _p,
         selectedLivestreamId: _l,
         originSource: _o,
         ...restOfQuery
      } = query
      /* eslint-enable @typescript-eslint/no-unused-vars */
      setSelectedId(null)
      void push(
         {
            pathname: pathname,
            query: restOfQuery,
         },
         undefined,
         { shallow: true }
      )
   }, [query, push, pathname])

   return (
      <>
         <GenericDashboardLayout>
            <Stack sx={styles.pageContainer}>
               <HeroSectionEngineering
                  panelEvents={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSectionEngineering />
               <ParticipatingCompaniesSectionEngineering companies={companies} />
               <SpeakersSectionEngineering
                  speakers={shuffledSpeakers}
                  companies={companies}
               />
               <RecordingsSectionEngineering
                  engineeringRecordings={deserializedEngineeringRecordings}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <RegisterNowSectionEngineering />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                  title="Not interested in engineering?"
                  subtitle="Explore other career-focused live streams"
               />
            </Stack>
         </GenericDashboardLayout>
         <LivestreamDialog
            key={selectedId}
            open={Boolean(selectedId)}
            livestreamId={selectedId || ""}
            handleClose={handleCloseLivestreamDialog}
            mode="stand-alone"
            initialPage={"details"}
            serverUserEmail={authenticatedUser?.email || ""}
            providedOriginSource={`engineering-overview-page-${selectedId}`}
         />
      </>
   )
}

export const getStaticProps: GetStaticProps<EngineeringPageProps> = async () => {
   try {
      // Fetch all data in parallel
      const [allUpcomingEvents, pastEvents] = await Promise.all([
         // Fetch upcoming events (will be used for both engineering events and recent livestreams)
         livestreamRepo.getUpcomingEvents(50), // Get more to ensure we have enough after filtering
         // Fetch past events for engineering recordings
         livestreamRepo.getPastEventsFrom({
            fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
            limit: 50, // Get more to ensure we have enough after filtering
         }),
      ])

      // Use first 10 for recent livestreams (for "Not interested in engineering?" section)
      const recentLivestreams = allUpcomingEvents?.slice(0, 10) || []

      // Filter upcoming events by Engineering or Manufacturing industry and limit to 6
      const engineeringLivestreams =
         allUpcomingEvents
            ?.filter((event) =>
               event.companyIndustries?.some((industry) =>
                  ["Engineering", "Manufacturing"].includes(industry)
               )
            )
            ?.slice(0, 6) || []

      // Filter past events by Engineering or Manufacturing industry and limit to 6 for recordings
      // First try to get events that are explicitly marked as recordings
      let engineeringRecordings =
         pastEvents
            ?.filter(
               (event) =>
                  event.companyIndustries?.some((industry) =>
                     ["Engineering", "Manufacturing"].includes(industry)
                  ) && event.isRecording // Only include events that have recordings
            )
            ?.sort((a, b) => b.start.toMillis() - a.start.toMillis()) // Sort by most recent first
            ?.slice(0, 6) || []

      // If we don't have enough recordings, fall back to all engineering past events
      // This ensures the section renders even if the isRecording flag isn't properly set
      if (engineeringRecordings.length === 0) {
         engineeringRecordings =
            pastEvents
               ?.filter(
                  (event) =>
                     event.companyIndustries?.some((industry) =>
                        ["Engineering", "Manufacturing"].includes(industry)
                     ) && event.hasEnded // Only include events that have ended
               )
               ?.sort((a, b) => b.start.toMillis() - a.start.toMillis()) // Sort by most recent first
               ?.slice(0, 6) || []
      }

      // Extract unique groupIds from engineering livestreams
      const allGroupIds = engineeringLivestreams
         .flatMap((event) => event.groupIds || [])
         .filter((groupId, index, array) => array.indexOf(groupId) === index) // Remove duplicates

      // Fetch companies from the groupIds
      const companies =
         allGroupIds.length > 0
            ? await groupRepo.getGroupsByIds(allGroupIds)
            : []

      // Serialize events for server-side props
      const serializedEngineeringEvents = engineeringLivestreams.map((event) =>
         LivestreamPresenter.serializeDocument(event)
      )

      // Handle moderators - filter out moderators from speakers
      const eventsWithoutModerators = serializedEngineeringEvents.map(
         (event) => {
            event.speakers = event.speakers?.filter(
               (speaker) => speaker.position !== "Moderator"
            )
            return {
               ...event,
               speakers: event.speakers,
            }
         }
      )

      const serializedRecentLivestreams =
         recentLivestreams?.map((stream) =>
            LivestreamPresenter.serializeDocument(stream)
         ) || []

      const serializedEngineeringRecordings = engineeringRecordings.map(
         (recording) => LivestreamPresenter.serializeDocument(recording)
      )

      const serializedCompanies = companies.map((company) =>
         serializeGroup(company)
      )

      // Filter out CareerFairy group
      const serializedCompaniesWithoutCF = serializedCompanies.filter(
         (company) => company.id !== CF_GROUP_ID
      )

      return {
         props: {
            serverSidePanelEvents: eventsWithoutModerators,
            serverSideCompanies: serializedCompaniesWithoutCF,
            serverSideRecentLivestreams: serializedRecentLivestreams,
            serverSideEngineeringRecordings: serializedEngineeringRecordings,
         },
         revalidate: 300, // Revalidate every 5 minutes
      }
   } catch (error) {
      console.error("Error fetching engineering page data:", error)

      return {
         props: {
            serverSidePanelEvents: [],
            serverSideCompanies: [],
            serverSideRecentLivestreams: [],
            serverSideEngineeringRecordings: [],
         },
         revalidate: 300, // Revalidate every 5 minutes
      }
   }
}

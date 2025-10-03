import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Stack } from "@mui/material"
import {
   HeroSectionFinanceBanking,
   ParticipatingCompaniesSectionFinanceBanking,
   RecordingsSectionFinanceBanking,
   RegisterNowSectionFinanceBanking,
   SpeakersSectionFinanceBanking,
   WhosThisForSectionFinanceBanking,
} from "components/views/finance-banking/page"
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
const WORLD_BANK_GROUP_ID = "qGGtl7ZfdoBbvZLFGbM2"

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

type FinanceBankingPageProps = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideFinanceBankingRecordings: any[]
}

export default function FinanceBankingPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
   serverSideFinanceBankingRecordings,
}: FinanceBankingPageProps) {
   const deserializedPanelEvents = mapFromServerSide(serverSidePanelEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const deserializedFinanceBankingRecordings = mapFromServerSide(
      serverSideFinanceBankingRecordings
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
                  originSource: "Finance_Banking_Overview_Page",
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
               <HeroSectionFinanceBanking
                  panelEvents={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSectionFinanceBanking />
               <ParticipatingCompaniesSectionFinanceBanking companies={companies} />
               <SpeakersSectionFinanceBanking
                  speakers={shuffledSpeakers}
                  companies={companies}
               />
               <RecordingsSectionFinanceBanking
                  financeBankingRecordings={deserializedFinanceBankingRecordings}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <RegisterNowSectionFinanceBanking />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                  title="Not interested in finance & banking?"
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
            providedOriginSource={`finance-banking-overview-page-${selectedId}`}
         />
      </>
   )
}

export const getStaticProps: GetStaticProps<FinanceBankingPageProps> = async () => {
   try {
      // Fetch all data in parallel
      const [allUpcomingEvents, pastEvents] = await Promise.all([
         // Fetch upcoming events (will be used for both finance & banking events and recent livestreams)
         livestreamRepo.getUpcomingEvents(50), // Get more to ensure we have enough after filtering
         // Fetch past events for finance & banking recordings
         livestreamRepo.getPastEventsFrom({
            fromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
            limit: 50, // Get more to ensure we have enough after filtering
         }),
      ])

      // Use first 10 for recent livestreams (for "Not interested in finance & banking?" section)
      const recentLivestreams = allUpcomingEvents?.slice(0, 10) || []

      // Filter upcoming events by Finance&Banking industry (excluding World Bank Group) and limit to 6
      const financeBankingLivestreams =
         allUpcomingEvents
            ?.filter((event) =>
               event.companyIndustries?.includes("Finance&Banking") &&
               !event.groupIds?.includes(WORLD_BANK_GROUP_ID)
            )
            ?.slice(0, 6) || []

      // Filter past events by Finance&Banking industry (excluding World Bank Group) and limit to 6 for recordings
      // First try to get events that are explicitly marked as recordings
      let financeBankingRecordings =
         pastEvents
            ?.filter(
               (event) =>
                  event.companyIndustries?.includes("Finance&Banking") &&
                  !event.groupIds?.includes(WORLD_BANK_GROUP_ID) &&
                  event.isRecording // Only include events that have recordings
            )
            ?.sort((a, b) => b.start.toMillis() - a.start.toMillis()) // Sort by most recent first
            ?.slice(0, 6) || []

      // If we don't have enough recordings, fall back to all finance & banking past events
      // This ensures the section renders even if the isRecording flag isn't properly set
      if (financeBankingRecordings.length === 0) {
         financeBankingRecordings =
            pastEvents
               ?.filter(
                  (event) =>
                     event.companyIndustries?.includes(
                        "Finance&Banking"
                     ) &&
                     !event.groupIds?.includes(WORLD_BANK_GROUP_ID) &&
                     event.hasEnded // Only include events that have ended
               )
               ?.sort((a, b) => b.start.toMillis() - a.start.toMillis()) // Sort by most recent first
               ?.slice(0, 6) || []
      }

      // Extract unique groupIds from finance & banking livestreams
      const allGroupIds = financeBankingLivestreams
         .flatMap((event) => event.groupIds || [])
         .filter((groupId, index, array) => array.indexOf(groupId) === index) // Remove duplicates

      // Fetch companies from the groupIds
      const companies =
         allGroupIds.length > 0
            ? await groupRepo.getGroupsByIds(allGroupIds)
            : []

      // Serialize events for server-side props
      const serializedFinanceBankingEvents = financeBankingLivestreams.map((event) =>
         LivestreamPresenter.serializeDocument(event)
      )

      // Handle moderators - filter out moderators from speakers
      const eventsWithoutModerators = serializedFinanceBankingEvents.map(
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

      const serializedFinanceBankingRecordings = financeBankingRecordings.map(
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
            serverSideFinanceBankingRecordings: serializedFinanceBankingRecordings,
         },
         revalidate: 300, // Revalidate every 5 minutes
      }
   } catch (error) {
      console.error("Error fetching finance & banking page data:", error)

      return {
         props: {
            serverSidePanelEvents: [],
            serverSideCompanies: [],
            serverSideRecentLivestreams: [],
            serverSideFinanceBankingRecordings: [],
         },
         revalidate: 300, // Revalidate every 5 minutes
      }
   }
}

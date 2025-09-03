import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Stack } from "@mui/material"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import {
   HeroSection,
   NotForYouSection,
   ParticipatingCompaniesSection,
   RegisterNowSection,
   SpeakersSection,
   WhatYouTakeAwaySection,
   WhosThisForSection,
} from "components/views/panels/page"
import { groupRepo, livestreamRepo } from "data/RepositoryInstances"
import { useAuth } from "HOCs/AuthProvider"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { deserializeGroupClient, mapFromServerSide } from "util/serverUtil"

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

type PanelsPageProps = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
}

export default function PanelsPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
}: PanelsPageProps) {
   const deserializedPanelEvents = mapFromServerSide(serverSidePanelEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const companies = serverSideCompanies.map((company) =>
      deserializeGroupClient(company)
   )

   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const [selectedPanelId, setSelectedPanelId] = useState<string | null>(
      query.selectedPanelId as string | null
   )

   const handleOpenLivestreamDialog = useCallback(
      (livestreamId: string) => {
         setSelectedPanelId(livestreamId)
         void push(
            {
               pathname: pathname,
               query: {
                  ...query,
                  selectedPanelId: livestreamId,
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [query, push, pathname]
   )

   const handleCloseLivestreamDialog = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { selectedPanelId: _, ...restOfQuery } = query
      setSelectedPanelId(null)
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
               <HeroSection
                  panelEvents={deserializedPanelEvents}
                  companies={companies}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSection />
               <SpeakersSection
                  speakers={deserializedPanelEvents.flatMap(
                     (panel) => panel.speakers || []
                  )}
                  companies={companies}
               />
               <ParticipatingCompaniesSection companies={companies} />
               <WhatYouTakeAwaySection />
               <RegisterNowSection
                  panelEvents={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
            </Stack>
         </GenericDashboardLayout>
         <LivestreamDialog
            key={selectedPanelId}
            open={Boolean(selectedPanelId)}
            livestreamId={selectedPanelId || ""}
            handleClose={handleCloseLivestreamDialog}
            mode="stand-alone"
            initialPage={"details"}
            serverUserEmail={authenticatedUser?.email || ""}
            providedOriginSource={`panels-overview-page-${selectedPanelId}`}
         />
      </>
   )
}

export const getServerSideProps: GetServerSideProps<
   PanelsPageProps
> = async () => {
   try {
      // Fetch all data in parallel
      const [recentLivestreams, allPanels] = await Promise.all([
         livestreamRepo.getUpcomingEvents(10),
         livestreamRepo.getAllPanels(),
      ])

      // Extract unique groupIds from all panels
      const allGroupIds = allPanels
         .flatMap((panel) => panel.groupIds || [])
         .filter((groupId, index, array) => array.indexOf(groupId) === index) // Remove duplicates

      // Fetch companies from the groupIds
      const companies =
         allGroupIds.length > 0
            ? await groupRepo.getGroupsByIds(allGroupIds)
            : []

      // Serialize events for server-side props
      const serializedPanelEvents = allPanels.map((panel) =>
         LivestreamPresenter.serializeDocument(panel)
      )

      // TODO: Handle moderators on second iteration of the panels
      const panelsWithoutModerators = serializedPanelEvents.map((panel) => {
         panel.speakers = panel.speakers?.filter(
            (speaker) => speaker.position !== "Moderator"
         )
         return {
            ...panel,
            speakers: panel.speakers,
         }
      })
      const serializedRecentLivestreams = recentLivestreams.map((stream) =>
         LivestreamPresenter.serializeDocument(stream)
      )
      const serializedCompanies = companies.map((company) =>
         serializeGroup(company)
      )

      return {
         props: {
            serverSidePanelEvents: panelsWithoutModerators,
            serverSideCompanies: serializedCompanies,
            serverSideRecentLivestreams: serializedRecentLivestreams,
         },
      }
   } catch (error) {
      console.error("Error fetching panels page data:", error)

      return {
         props: {
            serverSidePanelEvents: [],
            serverSideCompanies: [],
            serverSideRecentLivestreams: [],
         },
      }
   }
}

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

type ConsultingPageProps = {
   serverSideConsultingLivestreams: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
}

export default function ConsultingPage({
   serverSideConsultingLivestreams,
   serverSideCompanies,
   serverSideRecentLivestreams,
}: ConsultingPageProps) {
   const deserializedConsultingLivestreams = mapFromServerSide(
      serverSideConsultingLivestreams
   )
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const companies = serverSideCompanies.map((company) =>
      deserializeGroupClient(company)
   )

   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const [selectedId, setSelectedId] = useState<string | null>(
      (query.selectedPanelId as string | null) ||
         (query.selectedLivestreamId as string | null)
   )

   const handleOpenPanelDialog = useCallback(
      (panelId: string) => {
         setSelectedId(panelId)
         void push(
            {
               pathname: pathname,
               query: {
                  ...query,
                  selectedPanelId: panelId,
               },
            },
            undefined,
            { shallow: true }
         )
      },
      [query, push, pathname]
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
               <HeroSection
                  consultingLivestreams={deserializedConsultingLivestreams}
                  companies={companies}
                  handleOpenLivestreamDialog={handleOpenPanelDialog}
               />
               <WhosThisForSection />
               <SpeakersSection
                  speakers={deserializedConsultingLivestreams.flatMap(
                     (livestream) => livestream.speakers || []
                  )}
                  companies={companies}
                  variant="consulting"
               />
               <ParticipatingCompaniesSection
                  companies={companies}
                  variant="consulting"
               />
               <WhatYouTakeAwaySection />
               <RegisterNowSection
                  panelEvents={deserializedConsultingLivestreams}
                  handleOpenLivestreamDialog={handleOpenPanelDialog}
               />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
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
            providedOriginSource={`consulting-overview-page-${selectedId}`}
         />
      </>
   )
}

export const getServerSideProps: GetServerSideProps<
   ConsultingPageProps
> = async () => {
   try {
      // Fetch upcoming events and recent livestreams in parallel
      const [allUpcomingEvents, recentLivestreams] = await Promise.all([
         livestreamRepo.getUpcomingEvents(50), // Get more events to filter from
         livestreamRepo.getUpcomingEvents(10),
      ])

      // Filter for consulting industry livestreams (max 4)
      const consultingLivestreams = (allUpcomingEvents || [])
         .filter((livestream) =>
            livestream.companyIndustries?.includes("ManagementConsulting")
         )
         .slice(0, 4) // Limit to 4 livestreams

      // Extract unique groupIds from consulting livestreams
      const allGroupIds = consultingLivestreams
         .flatMap((livestream) => livestream.groupIds || [])
         .filter((groupId, index, array) => array.indexOf(groupId) === index) // Remove duplicates

      // Fetch companies from the groupIds
      const companies =
         allGroupIds.length > 0
            ? await groupRepo.getGroupsByIds(allGroupIds)
            : []

      // Serialize events for server-side props
      const serializedConsultingLivestreams = consultingLivestreams.map(
         (livestream) => LivestreamPresenter.serializeDocument(livestream)
      )

      // Filter out moderators from speakers
      const livestreamsWithoutModerators = serializedConsultingLivestreams.map(
         (livestream) => {
            livestream.speakers = livestream.speakers?.filter(
               (speaker) => speaker.position !== "Moderator"
            )
            return {
               ...livestream,
               speakers: livestream.speakers,
            }
         }
      )

      const serializedRecentLivestreams = (recentLivestreams || []).map(
         (stream) => LivestreamPresenter.serializeDocument(stream)
      )
      const serializedCompanies = companies.map((company) =>
         serializeGroup(company)
      )

      // Filter out CareerFairy company
      const serializedCompaniesWithoutCF = serializedCompanies.filter(
         (company) => company.id !== CF_GROUP_ID
      )

      return {
         props: {
            serverSideConsultingLivestreams: livestreamsWithoutModerators,
            serverSideCompanies: serializedCompaniesWithoutCF,
            serverSideRecentLivestreams: serializedRecentLivestreams,
         },
      }
   } catch (error) {
      console.error("Error fetching consulting page data:", error)

      return {
         props: {
            serverSideConsultingLivestreams: [],
            serverSideCompanies: [],
            serverSideRecentLivestreams: [],
         },
      }
   }
}

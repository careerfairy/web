import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { Stack } from "@mui/material"
import {
   HeroSection,
   NotForYouSection,
   ParticipatingCompaniesSection,
   RegisterNowSection,
   SpeakersSection,
   WhatYouTakeAwaySection,
   WhosThisForSection,
} from "components/views/consulting/page"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
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
   serverSideConsultingEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
}

export default function ConsultingPage({
   serverSideConsultingEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
}: ConsultingPageProps) {
   const deserializedConsultingEvents = mapFromServerSide(serverSideConsultingEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const companies = serverSideCompanies.map((company) =>
      deserializeGroupClient(company)
   )

   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const [selectedId, setSelectedId] = useState<string | null>(
      (query.selectedConsultingId as string | null) ||
         (query.selectedLivestreamId as string | null)
   )

   const handleOpenConsultingDialog = useCallback(
      (consultingId: string) => {
         setSelectedId(consultingId)
         void push(
            {
               pathname: pathname,
               query: {
                  ...query,
                  selectedConsultingId: consultingId,
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
         selectedConsultingId: _c,
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
                  consultingEvents={deserializedConsultingEvents}
                  companies={companies}
                  handleOpenLivestreamDialog={handleOpenConsultingDialog}
               />
               <WhosThisForSection />
               <SpeakersSection
                  speakers={deserializedConsultingEvents.flatMap(
                     (consulting) => consulting.speakers || []
                  )}
                  companies={companies}
               />
               <ParticipatingCompaniesSection companies={companies} />
               <WhatYouTakeAwaySection />
               <RegisterNowSection
                  consultingEvents={deserializedConsultingEvents}
                  handleOpenLivestreamDialog={handleOpenConsultingDialog}
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
      // Fetch all data in parallel
      const [recentLivestreams, allConsultingEvents] = await Promise.all([
         livestreamRepo.getUpcomingEvents(10),
         livestreamRepo.getAllConsultingEvents(),
      ])

      // Extract unique groupIds from all consulting events
      const allGroupIds = allConsultingEvents
         .flatMap((consulting) => consulting.groupIds || [])
         .filter((groupId, index, array) => array.indexOf(groupId) === index) // Remove duplicates

      // Fetch companies from the groupIds
      const companies =
         allGroupIds.length > 0
            ? await groupRepo.getGroupsByIds(allGroupIds)
            : []

      // Serialize events for server-side props
      const serializedConsultingEvents = allConsultingEvents.map((consulting) =>
         LivestreamPresenter.serializeDocument(consulting)
      )

      // TODO: Handle moderators on second iteration of the consulting events
      const consultingEventsWithoutModerators = serializedConsultingEvents.map((consulting) => {
         consulting.speakers = consulting.speakers?.filter(
            (speaker) => speaker.position !== "Moderator"
         )
         return {
            ...consulting,
            speakers: consulting.speakers,
         }
      })
      const serializedRecentLivestreams = recentLivestreams.map((stream) =>
         LivestreamPresenter.serializeDocument(stream)
      )
      const serializedCompanies = companies.map((company) =>
         serializeGroup(company)
      )

      // TODO: Handle CF in second iteration of the consulting events
      const serializedCompaniesWithoutCF = serializedCompanies.filter(
         (company) => company.id !== CF_GROUP_ID
      )

      return {
         props: {
            serverSideConsultingEvents: consultingEventsWithoutModerators,
            serverSideCompanies: serializedCompaniesWithoutCF,
            serverSideRecentLivestreams: serializedRecentLivestreams,
         },
      }
   } catch (error) {
      console.error("Error fetching consulting page data:", error)

      return {
         props: {
            serverSideConsultingEvents: [],
            serverSideCompanies: [],
            serverSideRecentLivestreams: [],
         },
      }
   }
}
import { SerializedGroup } from "@careerfairy/shared-lib/groups"
import { Stack } from "@mui/material"
import {
   HeroSection,
   ParticipatingCompaniesSection,
   RecordingsSection,
   RegisterNowSection,
   SpeakersSection,
   WhosThisForSection,
} from "components/views/common/landing-page"
import {
   consultingCompaniesConfig,
   consultingHeroConfig,
   consultingRecordingsConfig,
   consultingRegisterNowConfig,
   consultingSpeakersConfig,
   consultingWhosThisForConfig,
} from "components/views/common/landing-page/configs"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { NotForYouSection } from "components/views/panels/page"
import { useAuth } from "HOCs/AuthProvider"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { DateTime } from "luxon"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import {
   deserializeGroupClient,
   getLandingPageData,
   mapFromServerSide,
} from "util/serverUtil"

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
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideConsultingRecordings: any[]
   serverSideShuffledSpeakers: any[]
}

export default function ConsultingPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
   serverSideConsultingRecordings,
   serverSideShuffledSpeakers,
}: ConsultingPageProps) {
   const deserializedPanelEvents = mapFromServerSide(serverSidePanelEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const deserializedConsultingRecordings = mapFromServerSide(
      serverSideConsultingRecordings
   )
   const companies = serverSideCompanies.map((company) =>
      deserializeGroupClient(company)
   )

   // Speakers are shuffled on the server to avoid hydration errors
   const shuffledSpeakers = serverSideShuffledSpeakers

   const { authenticatedUser } = useAuth()
   const { push, query, pathname } = useRouter()
   const selectedId = query.selectedLivestreamId as string | undefined

   const handleOpenLivestreamDialog = useCallback(
      (livestreamId: string) => {
         void push(
            {
               pathname: pathname,
               query: {
                  ...query,
                  selectedLivestreamId: livestreamId,
                  originSource: "Consulting_Overview_Page",
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
         selectedLivestreamId: _l,
         originSource: _o,
         ...restOfQuery
      } = query
      /* eslint-enable @typescript-eslint/no-unused-vars */
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
                  config={consultingHeroConfig}
                  events={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSection config={consultingWhosThisForConfig} />
               <ParticipatingCompaniesSection
                  config={consultingCompaniesConfig}
                  companies={companies}
               />
               <SpeakersSection
                  config={consultingSpeakersConfig}
                  speakers={shuffledSpeakers}
                  companies={companies}
               />
               <RecordingsSection
                  config={consultingRecordingsConfig}
                  recordings={deserializedConsultingRecordings}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <RegisterNowSection config={consultingRegisterNowConfig} />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                  title="Not interested in consulting?"
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
            providedOriginSource={`consulting-overview-page-${selectedId}`}
         />
      </>
   )
}

export const getServerSideProps: GetServerSideProps<
   ConsultingPageProps
> = async () => {
   const data = await getLandingPageData({
      type: "industry",
      industries: ["ManagementConsulting"],
      recordingsFromDate: DateTime.now().minus({ years: 1 }).toJSDate(),
      upcomingLimit: 6,
      recordingsLimit: 6,
   })

   return {
      props: {
         serverSidePanelEvents: data.serverSidePanelEvents,
         serverSideCompanies: data.serverSideCompanies,
         serverSideRecentLivestreams: data.serverSideRecentLivestreams,
         serverSideConsultingRecordings: data.serverSideRecordings || [],
         serverSideShuffledSpeakers: data.serverSideShuffledSpeakers,
      },
   }
}

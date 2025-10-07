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
   fmcgCompaniesConfig,
   fmcgHeroConfig,
   fmcgRecordingsConfig,
   fmcgRegisterNowConfig,
   fmcgSpeakersConfig,
   fmcgWhosThisForConfig,
} from "components/views/common/landing-page/configs"
import LivestreamDialog from "components/views/livestream-dialog/LivestreamDialog"
import { NotForYouSection } from "components/views/panels/page"
import { useAuth } from "HOCs/AuthProvider"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import { GetStaticProps } from "next"
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

type FMCGPageProps = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideFMCGRecordings: any[]
   serverSideShuffledSpeakers: any[]
}

export default function FMCGPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
   serverSideFMCGRecordings,
   serverSideShuffledSpeakers,
}: FMCGPageProps) {
   const deserializedPanelEvents = mapFromServerSide(serverSidePanelEvents)
   const deserializedRecentLivestreams = mapFromServerSide(
      serverSideRecentLivestreams
   )
   const deserializedFMCGRecordings = mapFromServerSide(
      serverSideFMCGRecordings
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
                  originSource: "FMCG_Overview_Page",
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
                  config={fmcgHeroConfig}
                  events={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSection config={fmcgWhosThisForConfig} />
               <ParticipatingCompaniesSection
                  config={fmcgCompaniesConfig}
                  companies={companies}
               />
               <SpeakersSection
                  config={fmcgSpeakersConfig}
                  speakers={shuffledSpeakers}
                  companies={companies}
               />
               <RecordingsSection
                  config={fmcgRecordingsConfig}
                  recordings={deserializedFMCGRecordings}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <RegisterNowSection config={fmcgRegisterNowConfig} />
               <NotForYouSection
                  recentLivestreams={deserializedRecentLivestreams}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
                  title="Not interested in FMCG?"
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
            providedOriginSource={`fmcg-overview-page-${selectedId}`}
         />
      </>
   )
}

export const getStaticProps: GetStaticProps<FMCGPageProps> = async () => {
   const data = await getLandingPageData({
      type: "industry",
      industries: ["FMCG"],
      recordingsFromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
      upcomingLimit: 6,
      recordingsLimit: 6,
   })

   return {
      props: {
         serverSidePanelEvents: data.serverSidePanelEvents,
         serverSideCompanies: data.serverSideCompanies,
         serverSideRecentLivestreams: data.serverSideRecentLivestreams,
         serverSideFMCGRecordings: data.serverSideRecordings || [],
         serverSideShuffledSpeakers: data.serverSideShuffledSpeakers,
      },
      revalidate: 300, // Revalidate every 5 minutes
   }
}

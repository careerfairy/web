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
   engineeringCompaniesConfig,
   engineeringHeroConfig,
   engineeringRecordingsConfig,
   engineeringRegisterNowConfig,
   engineeringSpeakersConfig,
   engineeringWhosThisForConfig,
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

type EngineeringPageProps = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideEngineeringRecordings: any[]
   serverSideShuffledSpeakers: any[]
}

export default function EngineeringPage({
   serverSidePanelEvents,
   serverSideCompanies,
   serverSideRecentLivestreams,
   serverSideEngineeringRecordings,
   serverSideShuffledSpeakers,
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
                  config={engineeringHeroConfig}
                  events={deserializedPanelEvents}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <WhosThisForSection config={engineeringWhosThisForConfig} />
               <ParticipatingCompaniesSection
                  config={engineeringCompaniesConfig}
                  companies={companies}
               />
               <SpeakersSection
                  config={engineeringSpeakersConfig}
                  speakers={shuffledSpeakers}
                  companies={companies}
               />
               <RecordingsSection
                  config={engineeringRecordingsConfig}
                  recordings={deserializedEngineeringRecordings}
                  handleOpenLivestreamDialog={handleOpenLivestreamDialog}
               />
               <RegisterNowSection config={engineeringRegisterNowConfig} />
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

export const getServerSideProps: GetServerSideProps<
   EngineeringPageProps
> = async () => {
   const data = await getLandingPageData({
      type: "industry",
      industries: ["Engineering", "Manufacturing"],
      recordingsFromDate: DateTime.now().minus({ years: 1 }).toJSDate(),
      upcomingLimit: 6,
      recordingsLimit: 6,
   })

   return {
      props: {
         serverSidePanelEvents: data.serverSidePanelEvents,
         serverSideCompanies: data.serverSideCompanies,
         serverSideRecentLivestreams: data.serverSideRecentLivestreams,
         serverSideEngineeringRecordings: data.serverSideRecordings || [],
         serverSideShuffledSpeakers: data.serverSideShuffledSpeakers,
      },
   }
}

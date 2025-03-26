import { GroupEventActions } from "@careerfairy/shared-lib/groups/telemetry"
import { Box } from "@mui/material"
import { TabValue } from "components/views/company-page"
import { useCompaniesTracker } from "context/group/CompaniesTrackerProvider"
import { GetStaticPaths, InferGetStaticPropsType, NextPage } from "next"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerCompanyEvent } from "util/analyticsUtils"
import useTrackPageView from "../../../../components/custom-hook/useTrackDetailPageView"
import SEO from "../../../../components/util/SEO"
import CompanyPageOverview from "../../../../components/views/company-page"
import { useFirebaseService } from "../../../../context/firebase/FirebaseServiceContext"
import GenericDashboardLayout from "../../../../layouts/GenericDashboardLayout"
import {
   deserializeGroupClient,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../../util/serverUtil"
import { getCompanyPageData } from "../[[...livestreamDialog]]"

type TrackProps = {
   id: string
   visitorId: string
}

const SparksPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   groupCreators,
}) => {
   const { query, isReady } = useRouter()
   const { trackCompanyPageView } = useFirebaseService()
   const { trackEvent } = useCompaniesTracker()
   const { universityName, id } = deserializeGroupClient(serverSideGroup)

   const interactionSource = query.interactionSource?.toString() || null

   useEffect(() => {
      if (!isReady) return
      trackEvent(id, GroupEventActions.Page_View, interactionSource)
   }, [query.interactionSource, isReady, interactionSource, id, trackEvent])

   const viewRef = useTrackPageView({
      trackDocumentId: id,
      handleTrack: ({ id, visitorId }: TrackProps) =>
         trackCompanyPageView(id, visitorId).then(() =>
            dataLayerCompanyEvent(
               AnalyticsEvents.CompanyPageVisit,
               serverSideGroup
            )
         ),
   }) as unknown as React.RefObject<HTMLDivElement>

   return (
      <>
         <SEO
            id={`CareerFairy | ${universityName} | Sparks`}
            title={`CareerFairy | ${universityName} | Sparks`}
            description={`Discover ${universityName} with CareerFairy sparks`}
         />

         <GenericDashboardLayout pageDisplayName={""}>
            <Box
               sx={{ backgroundColor: "inherit", minHeight: "100vh" }}
               ref={viewRef}
            >
               <CompanyPageOverview
                  group={serverSideGroup}
                  groupCreators={groupCreators}
                  upcomingLivestreams={mapFromServerSide(
                     serverSideUpcomingLivestreams
                  )}
                  pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
                  customJobs={mapCustomJobsFromServerSide(serverSideCustomJobs)}
                  editMode={false}
                  tab={TabValue.sparks}
               />
            </Box>
         </GenericDashboardLayout>
      </>
   )
}

export const getStaticProps = async (ctx) => {
   const { companyName: companyNameSlug } = ctx.params || {}

   return getCompanyPageData({
      companyNameSlug: companyNameSlug as string,
      ctx,
   })
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default SparksPage

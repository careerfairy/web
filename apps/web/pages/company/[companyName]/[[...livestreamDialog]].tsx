import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import * as Sentry from "@sentry/nextjs"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import React from "react"
import useTrackPageView from "../../../components/custom-hook/useTrackDetailPageView"
import SEO from "../../../components/util/SEO"
import CompanyPageOverview from "../../../components/views/company-page"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "../../../components/views/livestream-dialog"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import { groupRepo } from "../../../data/RepositoryInstances"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import {
   getLivestreamsAndDialogData,
   mapFromServerSide,
} from "../../../util/serverUtil"

type TrackProps = {
   id: string
   visitorId: string
}

const CompanyPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   livestreamDialogData,
}) => {
   const { trackCompanyPageView } = useFirebaseService()
   const { universityName, id } = serverSideGroup

   const viewRef = useTrackPageView({
      trackDocumentId: id,
      handleTrack: ({ id, visitorId }: TrackProps) =>
         trackCompanyPageView(id, visitorId),
   }) as unknown as React.RefObject<HTMLDivElement>

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <SEO
            id={`CareerFairy | ${universityName}`}
            title={`CareerFairy | ${universityName}`}
         />

         <GenericDashboardLayout pageDisplayName={""}>
            <Box
               sx={{ backgroundColor: "inherit", minHeight: "100vh" }}
               ref={viewRef}
            >
               <CompanyPageOverview
                  group={serverSideGroup}
                  upcomingLivestreams={mapFromServerSide(
                     serverSideUpcomingLivestreams
                  )}
                  pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
                  editMode={false}
               />
            </Box>
         </GenericDashboardLayout>
      </LivestreamDialogLayout>
   )
}

export const getStaticProps: GetStaticProps<{
   serverSideGroup: Group
   serverSideUpcomingLivestreams: { [p: string]: any }[]
   serverSidePastLivestreams: { [p: string]: any }[]
   livestreamDialogData: LiveStreamDialogData
}> = async (ctx) => {
   const { params } = ctx
   const { companyName: companyNameSlug } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup) {
         if (serverSideGroup.publicProfile) {
            const {
               serverSideUpcomingLivestreams,
               serverSidePastLivestreams,
               livestreamDialogData,
            } = await getLivestreamsAndDialogData(serverSideGroup?.groupId, ctx)

            return {
               props: {
                  serverSideGroup,
                  serverSideUpcomingLivestreams:
                     serverSideUpcomingLivestreams?.map(
                        LivestreamPresenter.serializeDocument
                     ) || [],

                  serverSidePastLivestreams:
                     serverSidePastLivestreams?.map(
                        LivestreamPresenter.serializeDocument
                     ) || [],
                  livestreamDialogData,
               },
               revalidate: 60,
            }
         }

         Sentry.captureException(
            new Error(
               `Company page ${companyName} for groupId ${serverSideGroup.id} is not ready yet`
            ),
            {
               extra: {
                  serverSideGroup,
                  companyNameSlug,
               },
            }
         )

         // The page is not ready, return notFound to trigger a 404
         return {
            notFound: true,
            revalidate: 60, // <- ISR, interval in seconds between revalidations
         }
      }
   }

   Sentry.captureException(new Error(`Company ${companyName} not found`), {
      extra: {
         companyNameSlug,
         companyName,
      },
   })

   // The company is not found, return notFound to trigger a 404
   return {
      notFound: true,
      revalidate: 60, // <- ISR, interval in seconds between revalidations
   }
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default CompanyPage

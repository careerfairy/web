import React from "react"
import CompanyPageOverview from "../../../components/views/company-page"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo, livestreamRepo } from "../../../data/RepositoryInstances"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import { mapFromServerSide } from "../../../util/serverUtil"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import useTrackPageView from "../../../components/custom-hook/useTrackDetailPageView"
import { useFirebaseService } from "../../../context/firebase/FirebaseServiceContext"
import * as Sentry from "@sentry/nextjs"
import GenericDashboardLayout from "../../../layouts/GenericDashboardLayout"
import SEO from "../../../components/util/SEO"
import {
   getLivestreamDialogData,
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "../../../components/views/livestream-dialog"

type TrackProps = {
   id: string
   visitorId: string
}

const CompanyPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
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
   livestreamDialogData: LiveStreamDialogData
}> = async (ctx) => {
   const { params } = ctx
   const { companyName: companyNameSlug } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup) {
         if (serverSideGroup.publicProfile) {
            const results = await Promise.allSettled([
               livestreamRepo.getEventsOfGroup(
                  serverSideGroup?.groupId,
                  "upcoming",
                  { limit: 10 }
               ),
               getLivestreamDialogData(ctx),
            ])
            const [
               serverSideUpcomingLivestreamsResult,
               livestreamDialogDataResult,
            ] = results

            const serverSideUpcomingLivestreams =
               serverSideUpcomingLivestreamsResult.status === "fulfilled"
                  ? serverSideUpcomingLivestreamsResult.value
                  : []

            const livestreamDialogData =
               livestreamDialogDataResult.status === "fulfilled"
                  ? livestreamDialogDataResult.value
                  : null

            return {
               props: {
                  serverSideGroup,
                  serverSideUpcomingLivestreams:
                     serverSideUpcomingLivestreams?.map(
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

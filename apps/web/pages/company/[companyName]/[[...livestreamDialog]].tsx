import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import * as Sentry from "@sentry/nextjs"
import {
   CustomJobDialogData,
   CustomJobDialogLayout,
} from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import React from "react"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerGroupEvent } from "util/analyticsUtils"
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
   deserializeGroupClient,
   getLivestreamsAndDialogData,
   mapCustomJobsFromServerSide,
   mapFromServerSide,
} from "../../../util/serverUtil"

const PARAMETER_SOURCE = "livestreamDialog"

type TrackProps = {
   id: string
   visitorId: string
}

const CompanyPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   serverSideCustomJobs,
   livestreamDialogData,
   customJobDialogData,
   groupCreators,
}) => {
   const { trackCompanyPageView } = useFirebaseService()
   const { universityName, id } = deserializeGroupClient(serverSideGroup)

   const viewRef = useTrackPageView({
      trackDocumentId: id,
      handleTrack: ({ id, visitorId }: TrackProps) =>
         trackCompanyPageView(id, visitorId).then(() =>
            dataLayerGroupEvent(
               AnalyticsEvents.CompanyPageVisit,
               serverSideGroup
            )
         ),
   }) as unknown as React.RefObject<HTMLDivElement>

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogLayout
            customJobDialogData={customJobDialogData}
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            dialogSource={PARAMETER_SOURCE}
         >
            <SEO
               id={`CareerFairy | ${universityName}`}
               title={`CareerFairy | ${universityName}`}
            />

            <GenericDashboardLayout pageDisplayName={""} headerFixed>
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
                     pastLivestreams={mapFromServerSide(
                        serverSidePastLivestreams
                     )}
                     customJobs={mapCustomJobsFromServerSide(
                        serverSideCustomJobs
                     )}
                     editMode={false}
                  />
               </Box>
            </GenericDashboardLayout>
         </CustomJobDialogLayout>
      </LivestreamDialogLayout>
   )
}

export const getStaticProps: GetStaticProps<{
   serverSideGroup: SerializedGroup
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   serverSideUpcomingLivestreams: { [p: string]: any }[]
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   serverSidePastLivestreams: { [p: string]: any }[]
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   serverSideCustomJobs: { [p: string]: any }[]
   livestreamDialogData: LiveStreamDialogData
   customJobDialogData: CustomJobDialogData
   groupCreators: PublicCreator[]
}> = async (ctx) => {
   const { params } = ctx
   const { companyName: companyNameSlug } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup) {
         if (serverSideGroup.publicProfile) {
            const [
               {
                  serverSideUpcomingLivestreams,
                  serverSidePastLivestreams,
                  serverSideGroupAvailableCustomJobs,
                  livestreamDialogData,
               },
               customJobDialogData,
               creators,
            ] = await Promise.all([
               getLivestreamsAndDialogData(serverSideGroup?.groupId, ctx, {
                  hideHidden: true,
                  limit: undefined,
               }),
               getCustomJobDialogData(ctx, PARAMETER_SOURCE),
               groupRepo.getCreatorsWithPublicContent(serverSideGroup),
            ])

            return {
               props: {
                  serverSideGroup: serializeGroup(serverSideGroup),
                  serverSideUpcomingLivestreams:
                     serverSideUpcomingLivestreams?.map(
                        LivestreamPresenter.serializeDocument
                     ) || [],

                  serverSidePastLivestreams:
                     serverSidePastLivestreams?.map(
                        LivestreamPresenter.serializeDocument
                     ) || [],
                  serverSideCustomJobs:
                     serverSideGroupAvailableCustomJobs?.map(
                        CustomJobsPresenter.serializeDocument
                     ) || [],
                  livestreamDialogData,
                  customJobDialogData,
                  groupCreators: creators?.map(pickPublicDataFromCreator) || [],
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

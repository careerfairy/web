import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { GroupEventActions } from "@careerfairy/shared-lib/groups/telemetry"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import * as Sentry from "@sentry/nextjs"
import { TabValue } from "components/views/company-page"
import { CustomJobDialogProvider } from "components/views/jobs/components/custom-jobs/CustomJobDialogContext"
import { CustomJobDialogData } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import { useCompaniesTracker } from "context/group/CompaniesTrackerProvider"
import { fromDate } from "data/firebase/FirebaseInstance"
import {
   GetServerSidePropsContext,
   GetStaticPaths,
   GetStaticPathsContext,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import { useRouter } from "next/router"
import React, { useEffect, useMemo } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerCompanyEvent } from "util/analyticsUtils"
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
import { serverCustomJobGetter } from "./jobs/[[...livestreamDialog]]"

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
   const { query, isReady } = useRouter()
   const { trackCompanyPageView } = useFirebaseService()
   const { trackEvent } = useCompaniesTracker()
   const { universityName, id } = deserializeGroupClient(serverSideGroup)

   const customJobId = query.dialogJobId?.toString() || null
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

   const serverCustomJob = useMemo(() => {
      const { serverSideCustomJob } = customJobDialogData || {}
      if (!serverSideCustomJob) return null
      return CustomJobsPresenter.parseDocument(
         serverSideCustomJob as any,
         fromDate
      )
   }, [customJobDialogData])

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogProvider
            source={{ source: CustomJobApplicationSourceTypes.Group, id: id }}
            serverSideCustomJob={serverCustomJob}
            customJobId={customJobId}
         >
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
                     tab={TabValue.overview}
                  />
               </Box>
            </GenericDashboardLayout>
         </CustomJobDialogProvider>
      </LivestreamDialogLayout>
   )
}

type CompanyPageData = {
   serverSideGroup: SerializedGroup
   serverSideUpcomingLivestreams: ReturnType<
      typeof LivestreamPresenter.serializeDocument
   >[]
   serverSidePastLivestreams: ReturnType<
      typeof LivestreamPresenter.serializeDocument
   >[]
   serverSideCustomJobs: ReturnType<
      typeof CustomJobsPresenter.serializeDocument
   >[]
   livestreamDialogData: LiveStreamDialogData
   customJobDialogData: CustomJobDialogData
   groupCreators: PublicCreator[]
}

type GetCompanyPageDataParams = {
   companyNameSlug: string
   ctx: Parameters<GetStaticProps>[0]
   parameterSource?: string
   customJobGetter?: (
      ctx: GetServerSidePropsContext | GetStaticPathsContext
   ) => Promise<CustomJobDialogData>
}

export async function getCompanyPageData({
   companyNameSlug,
   ctx,
   parameterSource = PARAMETER_SOURCE,
   customJobGetter,
}: GetCompanyPageDataParams): Promise<{
   props?: CompanyPageData
   notFound: boolean
   revalidate: number
}> {
   const companyName = companyNameUnSlugify(companyNameSlug)

   if (!companyName) {
      Sentry.captureException(new Error(`Company ${companyName} not found`), {
         extra: { companyNameSlug, companyName },
      })
      return { notFound: true, revalidate: 60 }
   }

   const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

   if (!serverSideGroup) {
      Sentry.captureException(new Error(`Company ${companyName} not found`), {
         extra: { companyNameSlug, companyName },
      })
      return { notFound: true, revalidate: 60 }
   }

   if (!serverSideGroup.publicProfile) {
      Sentry.captureException(
         new Error(
            `Company page ${companyName} for groupId ${serverSideGroup.id} is not ready yet`
         ),
         { extra: { serverSideGroup, companyNameSlug } }
      )
      return { notFound: true, revalidate: 60 }
   }

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
      getLivestreamsAndDialogData(serverSideGroup.groupId, ctx, {
         hideHidden: true,
         limit: undefined,
      }),
      customJobGetter
         ? customJobGetter(ctx)
         : getCustomJobDialogData(ctx, parameterSource),
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
      notFound: false,
      revalidate: 60,
   }
}

export const getStaticProps = async (ctx) => {
   const { companyName: companyNameSlug } = ctx.params || {}

   return getCompanyPageData({
      companyNameSlug: companyNameSlug as string,
      ctx,
      customJobGetter: serverCustomJobGetter,
   })
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default CompanyPage

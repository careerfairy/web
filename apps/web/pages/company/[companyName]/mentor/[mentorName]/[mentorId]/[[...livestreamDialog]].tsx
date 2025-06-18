import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import {
   SerializedSpark,
   SparkPresenter,
} from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"
import { Box } from "@mui/material"
import * as Sentry from "@sentry/nextjs"
import useTrackPageView from "components/custom-hook/useTrackDetailPageView"
import SEO from "components/util/SEO"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "components/views/livestream-dialog"
import { MentorDetailPage } from "components/views/mentor-page"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { customJobRepo, groupRepo } from "data/RepositoryInstances"
import { sparkService } from "data/firebase/SparksService"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerMentorEvent } from "util/analyticsUtils"
import { getLivestreamsAndDialogData, mapFromServerSide } from "util/serverUtil"

const MentorPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   serverSideGroup,
   serverSideLivestreams,
   livestreamDialogData,
   sparks,
   creator,
   hasJobs,
}) => {
   const { trackMentorPageView } = useFirebaseService()

   const viewRef = useTrackPageView({
      trackDocumentId: serverSideGroup.groupId,
      handleTrack: ({ id, visitorId, extraData }) =>
         trackMentorPageView(id, extraData.creatorId, visitorId).then(() =>
            dataLayerMentorEvent(AnalyticsEvents.MentorPageVisit, creator)
         ),
      extraData: {
         creatorId: creator.id,
      },
   }) as unknown as React.RefObject<HTMLDivElement>

   const deseralizedSparks = sparks
      ?.map(SparkPresenter.deserialize)
      .map(SparkPresenter.toFirebaseObject)

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <SEO
            id={`CareerFairy | ${serverSideGroup.universityName} | ${creator.firstName} ${creator.lastName}`}
            title={`CareerFairy | ${serverSideGroup.universityName} | ${creator.firstName} ${creator.lastName}`}
         />

         <GenericDashboardLayout>
            <Box
               sx={{ backgroundColor: "inherit", minHeight: "100vh" }}
               ref={viewRef}
            >
               <MentorDetailPage
                  group={serverSideGroup}
                  mentor={creator}
                  livestreams={mapFromServerSide(serverSideLivestreams)}
                  sparks={deseralizedSparks}
                  hasJobs={hasJobs}
               />
            </Box>
         </GenericDashboardLayout>
      </LivestreamDialogLayout>
   )
}

export const getStaticProps: GetStaticProps<{
   serverSideGroup: SerializedGroup
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   serverSideLivestreams: { [p: string]: any }[]
   livestreamDialogData: LiveStreamDialogData
   sparks: SerializedSpark[]
   creator: PublicCreator
   hasJobs: boolean
}> = async (ctx) => {
   const { params } = ctx
   const { companyName: companyNameSlug, mentorName, mentorId } = params
   const companyName = companyNameUnSlugify(companyNameSlug as string)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup) {
         if (serverSideGroup.publicProfile) {
            const {
               serverSideUpcomingLivestreams,
               serverSidePastLivestreams,
               livestreamDialogData,
            } = await getLivestreamsAndDialogData(
               serverSideGroup?.groupId,
               ctx,
               {
                  hideHidden: true,
                  limit: undefined,
               }
            )

            const hasJobs =
               (await customJobRepo.getGroupJobs(serverSideGroup.groupId))
                  .length > 0

            const creator = await groupRepo.getCreatorByGroupAndId(
               serverSideGroup.groupId,
               mentorId as string
            )

            const sparks = serverSideGroup.publicSparks
               ? await sparkService.getCreatorPublicSparks(
                    mentorId as string,
                    serverSideGroup?.groupId
                 )
               : []

            const creatorLivestreams = {
               upcoming: serverSideUpcomingLivestreams?.filter((livestream) => {
                  return livestream.speakers.some(
                     (speaker) => speaker.id === creator.id
                  )
               }),
               past: serverSidePastLivestreams?.filter((livestream) => {
                  return livestream.speakers.some(
                     (speaker) => speaker.id === creator.id
                  )
               }),
            }

            return {
               props: {
                  serverSideGroup: serializeGroup(serverSideGroup),
                  serverSideLivestreams: [
                     ...(creatorLivestreams.upcoming?.map(
                        LivestreamPresenter.serializeDocument
                     ) || []),
                     ...(creatorLivestreams.past?.map(
                        LivestreamPresenter.serializeDocument
                     ) || []),
                  ],
                  livestreamDialogData,
                  sparks: sparks.map((spark) =>
                     SparkPresenter.serialize(spark)
                  ),
                  creator: pickPublicDataFromCreator(creator),
                  hasJobs,
               },
               revalidate: 60,
            }
         }

         Sentry.captureException(
            new Error(
               `Mentor page ${mentorName} with id ${mentorId[0]} of group ${serverSideGroup.id} is not ready yet`
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

   Sentry.captureException(
      new Error(
         `Mentor ${mentorName} with id ${mentorId} of group ${companyNameSlug} not found`
      ),
      {
         extra: {
            mentorName,
            mentorId,
            companyNameSlug,
         },
      }
   )

   // The mentor is not found, return notFound to trigger a 404
   return {
      notFound: true,
      revalidate: 60, // <- ISR, interval in seconds between revalidations
   }
}

export const getStaticPaths: GetStaticPaths = () => ({
   paths: [],
   fallback: "blocking",
})

export default MentorPage

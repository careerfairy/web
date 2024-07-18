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
import SEO from "components/util/SEO"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "components/views/livestream-dialog"
import { MentorDetailPage } from "components/views/mentor-page"
import { groupRepo } from "data/RepositoryInstances"
import { sparkService } from "data/firebase/SparksService"
import GenericDashboardLayout from "layouts/GenericDashboardLayout"
import {
   GetStaticPaths,
   GetStaticProps,
   InferGetStaticPropsType,
   NextPage,
} from "next"
import { getLivestreamsAndDialogData, mapFromServerSide } from "util/serverUtil"

const MentorPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   serverSideGroup,
   serverSideLivestreams,
   livestreamDialogData,
   sparks,
   creator,
}) => {
   // TODO: track page view (example below), move slug creation out of Mentor Card, make this pretty and fix carousels
   /* 
   const viewRef = useTrackPageView({
      trackDocumentId: id,
      handleTrack: ({ id, visitorId }: TrackProps) =>
         trackCompanyPageView(id, visitorId),
   }) as unknown as React.RefObject<HTMLDivElement>
   */

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
               //ref={viewRef}
            >
               <MentorDetailPage
                  companyName={serverSideGroup.universityName}
                  mentor={creator}
                  livestreams={mapFromServerSide(serverSideLivestreams)}
                  sparks={deseralizedSparks}
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
            } = await getLivestreamsAndDialogData(serverSideGroup?.groupId, ctx)

            const creator = await groupRepo.getCreatorById(
               serverSideGroup?.groupId,
               mentorId as string
            )

            const sparks = await sparkService.getCreatorSparks(
               mentorId as string,
               serverSideGroup?.groupId
            )

            const creatorLivestreams = {
               upcoming: serverSideUpcomingLivestreams?.filter((livestream) => {
                  return livestream.speakers.some(
                     (speaker) => speaker.email === creator.email
                  )
               }),
               past: serverSidePastLivestreams?.filter((livestream) => {
                  return livestream.speakers.some(
                     (speaker) => speaker.email === creator.email
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

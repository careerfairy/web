import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SerializedGroup, serializeGroup } from "@careerfairy/shared-lib/groups"
import {
   PublicCreator,
   pickPublicDataFromCreator,
} from "@careerfairy/shared-lib/groups/creators"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { CustomJobDialogProvider } from "components/views/jobs/components/custom-jobs/CustomJobDialogContext"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "components/views/livestream-dialog"
import { groupRepo } from "data/RepositoryInstances"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import CompanyPageOverview, {
   TabValue,
} from "../../../../../components/views/company-page"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import {
   deserializeGroupClient,
   getLivestreamsAndDialogData,
   getServerSideGroup,
   mapFromServerSide,
} from "../../../../../util/serverUtil"

const CompanyPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({
   serverSideGroup,
   serverSideUpcomingLivestreams,
   serverSidePastLivestreams,
   livestreamDialogData,
   groupCreators,
}) => {
   const { query } = useRouter()
   const { groupId, universityName } = serverSideGroup
   const customJobId = query.dialogJobId?.toString() || null

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <CustomJobDialogProvider
            source={{
               source: CustomJobApplicationSourceTypes.Group,
               id: groupId,
            }}
            customJobId={customJobId}
         >
            <GroupDashboardLayout titleComponent={"Company Page"}>
               <DashboardHead title={`CareerFairy | ${universityName}`} />
               <CompanyPageOverview
                  group={deserializeGroupClient(serverSideGroup)}
                  groupCreators={groupCreators}
                  upcomingLivestreams={mapFromServerSide(
                     serverSideUpcomingLivestreams
                  )}
                  pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
                  customJobs={[]}
                  editMode={true}
                  tab={TabValue.overview}
                  tabMode
               />
               <SparkPreviewDialog />
            </GroupDashboardLayout>
         </CustomJobDialogProvider>
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps: GetServerSideProps<{
   serverSideGroup: SerializedGroup
   serverSideUpcomingLivestreams: any[]
   serverSidePastLivestreams: any[]
   livestreamDialogData: LiveStreamDialogData
   groupCreators: PublicCreator[]
}> = async (context) => {
   try {
      const { groupId } = context.params

      const serverSideGroup = await getServerSideGroup(groupId as string)

      if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
         return {
            notFound: true,
         }
      }

      const {
         serverSideUpcomingLivestreams,
         serverSidePastLivestreams,
         livestreamDialogData,
      } = await getLivestreamsAndDialogData(serverSideGroup?.groupId, context)

      const creators = await groupRepo.getCreatorsWithPublicContent(
         serverSideGroup
      )

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
            livestreamDialogData,
            groupCreators: creators?.map(pickPublicDataFromCreator) || [],
         },
      }
   } catch (e) {
      console.error(e)
      return {
         notFound: true,
      }
   }
}

export default CompanyPage

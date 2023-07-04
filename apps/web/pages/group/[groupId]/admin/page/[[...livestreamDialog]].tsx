import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import {
   LiveStreamDialogData,
   LivestreamDialogLayout,
} from "components/views/livestream-dialog"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import CompanyPageOverview from "../../../../../components/views/company-page"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import {
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
}) => {
   const { groupId, universityName } = serverSideGroup

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <GroupDashboardLayout
            pageDisplayName={"Company Page"}
            groupId={groupId}
         >
            <DashboardHead title={`CareerFairy | ${universityName}`} />
            <CompanyPageOverview
               group={serverSideGroup}
               upcomingLivestreams={mapFromServerSide(
                  serverSideUpcomingLivestreams
               )}
               pastLivestreams={mapFromServerSide(serverSidePastLivestreams)}
               editMode={true}
            />
         </GroupDashboardLayout>
      </LivestreamDialogLayout>
   )
}

export const getServerSideProps: GetServerSideProps<{
   serverSideGroup: Group
   serverSideUpcomingLivestreams: any[]
   serverSidePastLivestreams: any[]
   livestreamDialogData: LiveStreamDialogData
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
      }
   } catch (e) {
      console.error(e)
      return {
         notFound: true,
      }
   }
}

export default CompanyPage

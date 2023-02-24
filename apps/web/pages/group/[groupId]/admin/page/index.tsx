import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import {
   getServerSideGroup,
   getServerSideUpcomingLivestreamsByGroupId,
   mapFromServerSide,
} from "../../../../../util/serverUtil"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyPageOverview from "../../../../../components/views/company-page"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"

const CompanyPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serverSideGroup, serverSideUpcomingLivestreams }) => {
   const { groupId, universityName } = serverSideGroup

   return (
      <GroupDashboardLayout pageDisplayName={"Company Page"} groupId={groupId}>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <CompanyPageOverview
            group={serverSideGroup}
            upcomingLivestreams={mapFromServerSide(
               serverSideUpcomingLivestreams
            )}
            editMode={true}
         />
      </GroupDashboardLayout>
   )
}

export const getServerSideProps: GetServerSideProps<{
   serverSideGroup: Group
   serverSideUpcomingLivestreams: any[]
}> = async (context) => {
   const { groupId } = context.params

   const serverSideGroup = await getServerSideGroup(groupId as string)

   if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
      return {
         notFound: true,
      }
   }

   const serverSideUpcomingLivestreams =
      await getServerSideUpcomingLivestreamsByGroupId(serverSideGroup.groupId)

   return {
      props: {
         serverSideGroup,
         serverSideUpcomingLivestreams:
            serverSideUpcomingLivestreams?.map(
               LivestreamPresenter.serializeDocument
            ) || [],
      },
   }
}

export default CompanyPage

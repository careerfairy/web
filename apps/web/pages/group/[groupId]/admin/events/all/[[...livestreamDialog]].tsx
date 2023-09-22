import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../../../components/util/Skeletons"
import AllEventsContent from "../../../../../../components/views/group/admin/all-events"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../../../../../components/views/livestream-dialog"
import { InferGetServerSidePropsType, NextPage } from "next"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>
const AllEventsPage: NextPage<Props> = ({ groupId, livestreamDialogData }) => (
   <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
      <GroupDashboardLayout
         titleComponent={"All Live Streams"}
         groupId={groupId}
      >
         <DashboardHead title="CareerFairy | All Livestreams" />
         <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
            <AllEventsContent />
         </SuspenseWithBoundary>
      </GroupDashboardLayout>
   </LivestreamDialogLayout>
)

export async function getServerSideProps(context) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
         livestreamDialogData: await getLivestreamDialogData(context),
      },
   }
}

export default AllEventsPage

import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import JobsContent from "../../../../components/views/group/admin/jobs"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import PrivacyPolicyDialog from "../../../../components/views/group/admin/jobs/PrivacyPolicyDialog"

const Jobs = ({ groupId }) => (
   <GroupDashboardLayout titleComponent={"Jobs"} groupId={groupId as string}>
      <DashboardHead title="CareerFairy | Jobs" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <JobsContent />
         <PrivacyPolicyDialog />
      </SuspenseWithBoundary>
   </GroupDashboardLayout>
)

export async function getServerSideProps(context) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}
export default Jobs

import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import JobsContent from "../../../../components/views/group/admin/jobs"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import PrivacyPolicyDialog from "../../../../components/views/group/admin/jobs/PrivacyPolicyDialog"
import CreateJobButton from "../../../../components/views/admin/jobs/components/CreateJobButton"
import JobFormDialog from "../../../../components/views/group/admin/jobs/JobFormDialog"

const Jobs = ({ groupId }) => (
   <GroupDashboardLayout
      titleComponent={"Jobs"}
      groupId={groupId as string}
      topBarCta={<CreateJobButton />}
   >
      <DashboardHead title="CareerFairy | Jobs" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <JobsContent />
         <PrivacyPolicyDialog />
         <JobFormDialog />
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

import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import JobsContent from "../../../../../components/views/group/admin/jobs"
import { SkeletonAdminPage } from "../../../../../components/util/Skeletons"
import { SuspenseWithBoundary } from "../../../../../components/ErrorBoundary"
import CreateJobButton from "../../../../../components/views/admin/jobs/components/CreateJobButton"
import { GetServerSidePropsContext } from "next"
import JobDialog from "../../../../../components/views/group/admin/jobs/dialog"

const Jobs = ({ groupId }) => (
   <GroupDashboardLayout
      titleComponent={"Jobs"}
      groupId={groupId as string}
      topBarCta={<CreateJobButton />}
   >
      <DashboardHead title="CareerFairy | Jobs" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <JobsContent />
      </SuspenseWithBoundary>
      <JobDialog />
   </GroupDashboardLayout>
)

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}
export default Jobs

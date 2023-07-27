import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import AtsIntegrationContent from "../../../../components/views/group/admin/ats-integration"

const AtsIntegration = ({ groupId }) => (
   <GroupDashboardLayout titleComponent={"ATS Integration"} groupId={groupId}>
      <DashboardHead title="CareerFairy | ATS Integration" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <AtsIntegrationContent />
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

export default AtsIntegration

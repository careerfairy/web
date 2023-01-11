import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SuspenseWithBoundary } from "../../../../components/ErrorBoundary"
import { SkeletonAdminPage } from "../../../../components/util/Skeletons"
import AllEventsContent from "../../../../components/views/group/admin/all-events"

const AllEventsPage = ({ groupId }) => (
   <GroupDashboardLayout pageDisplayName={"All Live Streams"} groupId={groupId}>
      <DashboardHead title="CareerFairy | All Livestreams" />
      <SuspenseWithBoundary fallback={<SkeletonAdminPage />}>
         <AllEventsContent />
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

export default AllEventsPage

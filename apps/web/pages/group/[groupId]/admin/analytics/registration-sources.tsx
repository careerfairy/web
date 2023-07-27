import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import AnalyticsRegistrationSourcesPageContent from "components/views/group/admin/analytics-new/registration-sources"

const RegistrationSourcesPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Registration Sources"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Registration Sources of" />

         <AnalyticsRegistrationSourcesPageContent />
      </GroupDashboardLayout>
   )
}

export default RegistrationSourcesPage

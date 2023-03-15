import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import GeneralAnalyticsPageContent from "components/views/group/admin/analytics"

const MainPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         pageDisplayName={"Main Page"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Main Page of" />

         <GeneralAnalyticsPageContent />
      </GroupDashboardLayout>
   )
}

export default MainPage

import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import AnalyticsGeneralPageContent from "components/views/group/admin/analytics-new/general"

const GeneralPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"General"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | General Page of" />

         <AnalyticsGeneralPageContent />
      </GroupDashboardLayout>
   )
}

export default GeneralPage

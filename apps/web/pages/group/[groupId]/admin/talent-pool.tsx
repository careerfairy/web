import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import AnalyticsTalentPoolPageContent from "components/views/group/admin/analytics-new/talent-pool"

const TalentPoolPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Talent Pool"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Talent Pool of" />

         <AnalyticsTalentPoolPageContent />
      </GroupDashboardLayout>
   )
}

export default TalentPoolPage

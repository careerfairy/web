import AnalyticsTalentPoolPageContent from "components/views/group/admin/analytics-new/talent-pool"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"

const TalentPoolPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Talent Pool"}>
         <DashboardHead title="CareerFairy | Talent Pool of" />

         <AnalyticsTalentPoolPageContent />
      </GroupDashboardLayout>
   )
}

export default TalentPoolPage

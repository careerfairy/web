import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import AnalyticsFeedbackPageContent from "../../../../../../components/views/group/admin/analytics-new/feedback"

const FeedbackPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Feedback"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Feedback of" />
         <AnalyticsFeedbackPageContent />
      </GroupDashboardLayout>
   )
}

export default FeedbackPage

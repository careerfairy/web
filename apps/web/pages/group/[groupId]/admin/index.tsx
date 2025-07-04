import MainPageContent from "components/views/group/admin/main"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"

const MainPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Dashboard"}>
         <DashboardHead title="CareerFairy | Dashboard of" />

         <MainPageContent />
      </GroupDashboardLayout>
   )
}

export default MainPage

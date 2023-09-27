import CompanyInformationPageContent from "components/views/group/admin/company-information"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"

const MainPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Main Page"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Main Page of" />

         <CompanyInformationPageContent />
      </GroupDashboardLayout>
   )
}

export default MainPage

import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "../../../../../layouts/GroupDashboardLayout/SubNavigationTabs"

import CompanyInformationPageContent from "components/views/group/admin/company-information"

const GeneralSettingsPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Settings"}>
         <DashboardHead title="CareerFairy | Admin Edit Details of" />
         <SubNavigationTabs showSubNavigationFor="settings" />
         <CompanyInformationPageContent />
      </GroupDashboardLayout>
   )
}

export default GeneralSettingsPage

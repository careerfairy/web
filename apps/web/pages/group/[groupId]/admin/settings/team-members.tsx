import RolesOverview from "../../../../../components/views/group/admin/roles"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "../../../../../layouts/GroupDashboardLayout/SubNavigationTabs"

const TeamMembersPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Settings"}>
         <DashboardHead title="CareerFairy | Member Roles of" />
         <SubNavigationTabs showSubNavigationFor="settings" />
         <RolesOverview />
      </GroupDashboardLayout>
   )
}

export default TeamMembersPage

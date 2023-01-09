import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import RolesOverview from "../../../../components/views/group/admin/roles"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"

const RolesPage = ({ groupId }) => {
   return (
      <GroupDashboardLayout pageDisplayName={"Roles"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Member Roles of" />
         <RolesOverview />
      </GroupDashboardLayout>
   )
}
export async function getServerSideProps(context) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}

export default RolesPage

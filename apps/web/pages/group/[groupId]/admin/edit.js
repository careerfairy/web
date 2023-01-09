import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import EditOverview from "../../../../components/views/group/admin/edit"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"

const EditGroupProfile = ({ groupId }) => {
   return (
      <GroupDashboardLayout
         pageDisplayName={"Edit Group Profile"}
         groupId={groupId}
      >
         <DashboardHead title="CareerFairy | Admin Edit Details of" />
         <EditOverview />
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
export default EditGroupProfile

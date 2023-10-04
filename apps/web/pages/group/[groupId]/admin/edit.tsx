import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"

import CompanyInformationPageContent from "components/views/group/admin/company-information"

const EditGroupProfile = ({ groupId }) => {
   return (
      <GroupDashboardLayout
         titleComponent={"Company Information"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Admin Edit Details of" />
         <CompanyInformationPageContent />
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

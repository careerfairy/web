import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { getServerSideGroup } from "../../../../../util/serverUtil"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyPageOverview from "../../../../../components/views/company-page"

const CompanyPage = ({ serverSideGroup }) => {
   const { groupId, universityName } = serverSideGroup as Group
   return (
      <GroupDashboardLayout pageDisplayName={"Company Page"} groupId={groupId}>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <CompanyPageOverview group={serverSideGroup} editMode={true} />
      </GroupDashboardLayout>
   )
}

export async function getServerSideProps(context) {
   const { groupId } = context.params

   const serverSideGroup = await getServerSideGroup(groupId)

   if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
      return {
         notFound: true,
      }
   }
   return {
      props: {
         serverSideGroup,
      },
   }
}

export default CompanyPage

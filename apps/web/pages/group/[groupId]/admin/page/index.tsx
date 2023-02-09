import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { getServerSideGroup } from "../../../../../util/serverUtil"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyPageOverview from "../../../../../components/views/group/admin/page"

const CompanyPage = ({ serverSideGroup }) => {
   const {
      groupId,
      universityName,
      publicProfile = true,
   } = serverSideGroup as Group
   return (
      <GroupDashboardLayout pageDisplayName={"Company Page"} groupId={groupId}>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         {publicProfile ? (
            <CompanyPageOverview group={serverSideGroup} />
         ) : (
            <> PROFILE NOT PUBLIC </>
         )}
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

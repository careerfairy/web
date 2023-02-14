import DashboardHead from "../../layouts/GroupDashboardLayout/DashboardHead"
import CompanyPageOverview from "../../components/views/group/admin/page"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo } from "../../data/RepositoryInstances"
import { companyNameUnSlugify } from "@careerfairy/shared-lib/utils"

const CompanyPage = ({ serverSideGroup }) => {
   const { universityName } = serverSideGroup as Group

   return (
      <>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <CompanyPageOverview group={serverSideGroup} editMode={false} />
      </>
   )
}

export const getServerSideProps = async (context) => {
   const { companyName: companyNameSlug } = context.params
   const companyName = companyNameUnSlugify(companyNameSlug)

   if (companyName) {
      const serverSideGroup = await groupRepo.getGroupByGroupName(companyName)

      if (serverSideGroup && serverSideGroup.publicProfile) {
         return {
            props: {
               serverSideGroup,
            },
         }
      }
   }
   return {
      notFound: true,
   }
}

export default CompanyPage

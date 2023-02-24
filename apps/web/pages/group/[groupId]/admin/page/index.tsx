import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import { getServerSideGroup } from "../../../../../util/serverUtil"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyPageOverview from "../../../../../components/views/company-page"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"

const CompanyPage: NextPage<
   InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ serverSideGroup }) => {
   const { groupId, universityName } = serverSideGroup
   return (
      <GroupDashboardLayout pageDisplayName={"Company Page"} groupId={groupId}>
         <DashboardHead title={`CareerFairy | ${universityName}`} />
         <CompanyPageOverview group={serverSideGroup} editMode={true} />
      </GroupDashboardLayout>
   )
}

export const getServerSideProps: GetServerSideProps<{
   serverSideGroup: Group
}> = async (context) => {
   const { groupId } = context.params

   const serverSideGroup = await getServerSideGroup(groupId as string)

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

import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import {
   GetServerSidePropsContext,
   InferGetServerSidePropsType,
   NextPage,
} from "next"
import AdminProfileOverview from "../../../../components/views/group/admin/profile"

type Props = InferGetServerSidePropsType<typeof getServerSideProps>
const EditAdminProfile: NextPage<Props> = ({ groupId }) => {
   return (
      <GroupDashboardLayout pageDisplayName={"My Profile"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Admin Edit Details of" />
         <AdminProfileOverview />
      </GroupDashboardLayout>
   )
}
export const getServerSideProps = async (
   context: GetServerSidePropsContext
) => {
   const { groupId } = context.params
   return {
      props: {
         groupId: groupId as string,
      },
   }
}
export default EditAdminProfile

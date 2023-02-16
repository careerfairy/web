import MainPageContent from "components/views/group/admin/main"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { GetServerSideProps } from "next"

const MainPage = ({ groupId }) => {
   return (
      <GroupDashboardLayout pageDisplayName={"Main Page"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Main Page of" />
         <MainPageContent />
      </GroupDashboardLayout>
   )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}

export default MainPage

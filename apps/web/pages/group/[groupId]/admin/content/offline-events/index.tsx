import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { OfflineEventsOverview } from "components/views/group/admin/offline-events/OfflineEventsOverview"
import { groupRepo } from "data/RepositoryInstances"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { GetServerSideProps } from "next"
import { ReactElement } from "react"

const OfflineEventsPage = () => <OfflineEventsOverview />

OfflineEventsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      dashboardHeadTitle: "CareerFairy | My Offline Events",
      subNavigationFor: "content",
   })(page)
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   try {
      const { groupId } = context.params

      const serverSideGroup = await groupRepo.getGroupById(groupId as string)

      if (!serverSideGroup) {
         return {
            notFound: true,
         }
      }

      // Create GroupPresenter to check permissions
      const groupPresenter = GroupPresenter.createFromDocument(serverSideGroup)

      // Check if group can create offline events
      if (!groupPresenter.canCreateOfflineEvents(true)) {
         return {
            notFound: true,
         }
      }

      return {
         props: {},
      }
   } catch (e) {
      return {
         notFound: true,
      }
   }
}

export default OfflineEventsPage

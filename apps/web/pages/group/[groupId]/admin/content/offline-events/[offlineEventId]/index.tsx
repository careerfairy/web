import useAdminGroup from "components/custom-hook/useAdminGroup"
import { BackToOfflineEventsHeader } from "components/views/group/admin/offline-events/detail/BackToOfflineEventsHeader"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { ReactElement } from "react"

type NextPageWithLayout = NextPage & {
   getLayout?: (page: ReactElement) => ReactElement
}

// Wrapper component to handle hooks and context setup
const OfflineEventLayoutWrapper = ({
   children,
}: {
   children: ReactElement
}) => {
   const router = useRouter()
   const { groupId } = router.query
   const { group } = useAdminGroup(groupId as string)

   if (!groupId || !group) return children

   // TODO: add all wrappers back
   return children
}

const OfflineEventAdminDetailsPage: NextPageWithLayout = () => {
   return <div>FORM PLACEHOLDER</div>
}

OfflineEventAdminDetailsPage.getLayout = function getLayout(
   page: ReactElement
) {
   return withGroupDashboardLayout({
      titleComponent: (router) => (
         <BackToOfflineEventsHeader groupId={router.query.groupId as string} />
      ),
      // TODO: add all top bar components back in last stack
      // topBarAction: <OfflineEventTopActions />,
      // topBarNavigation: <OfflineEventAdminDetailTopBarNavigation />,
      // bottomBarNavigation: <OfflineEventAdminDetailBottomBarNavigation />,
      backgroundColor: "#FDFDFD",
      dashboardHeadTitle: "CareerFairy | Editing Offline Event of ",
      wrapper: (layoutContent) => (
         <OfflineEventLayoutWrapper>{layoutContent}</OfflineEventLayoutWrapper>
      ),
   })(page)
}

export default OfflineEventAdminDetailsPage

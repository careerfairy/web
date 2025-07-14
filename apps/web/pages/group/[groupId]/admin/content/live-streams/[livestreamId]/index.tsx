import useAdminGroup from "components/custom-hook/useAdminGroup"
import { BackToStreamsHeader } from "components/views/group/admin/events/detail/BackToStreamsHeader"
import { LivestreamAutoSaveContextProvider } from "components/views/group/admin/events/detail/LivestreamAutoSaveContext"
import { LivestreamCreationContextProvider } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import { LivestreamTopActions } from "components/views/group/admin/events/detail/LivestreamTopActions"
import LivestreamForm from "components/views/group/admin/events/detail/form/LivestreamForm"
import LivestreamFormikProvider from "components/views/group/admin/events/detail/form/LivestreamFormikProvider"
import LivestreamAdminDetailTopBarNavigation from "components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import { withGroupDashboardLayout } from "layouts/GroupDashboardLayout/withGroupDashboardLayout"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { ReactElement } from "react"
import LivestreamFetchWrapper from "../../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"

type NextPageWithLayout = NextPage & {
   getLayout?: (page: ReactElement) => ReactElement
}

// Wrapper component to handle hooks and context setup
const LivestreamLayoutWrapper = ({ children }: { children: ReactElement }) => {
   const router = useRouter()
   const { groupId, livestreamId } = router.query
   const { group } = useAdminGroup(groupId as string)

   if (!groupId || !group) return children

   return (
      <LivestreamFetchWrapper livestreamId={livestreamId as string}>
         {(livestream) => (
            <LivestreamFormikProvider livestream={livestream} group={group}>
               <LivestreamCreationContextProvider
                  livestream={livestream}
                  group={group}
               >
                  <LivestreamAutoSaveContextProvider>
                     {children}
                  </LivestreamAutoSaveContextProvider>
               </LivestreamCreationContextProvider>
            </LivestreamFormikProvider>
         )}
      </LivestreamFetchWrapper>
   )
}

const LivestreamAdminDetailsPage: NextPageWithLayout = () => {
   return <LivestreamForm />
}

LivestreamAdminDetailsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: (router) => (
         <BackToStreamsHeader groupId={router.query.groupId as string} />
      ),
      topBarAction: <LivestreamTopActions />,
      topBarNavigation: <LivestreamAdminDetailTopBarNavigation />,
      bottomBarNavigation: <LivestreamAdminDetailBottomBarNavigation />,
      backgroundColor: "#FDFDFD",
      dashboardHeadTitle: "CareerFairy | Editing Live Stream of ",
      wrapper: (layoutContent) => (
         <LivestreamLayoutWrapper>{layoutContent}</LivestreamLayoutWrapper>
      ),
   })(page)
}

export default LivestreamAdminDetailsPage

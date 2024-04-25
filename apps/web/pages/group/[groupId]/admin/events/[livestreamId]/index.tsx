import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import { LivestreamCreationContextProvider } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import LivestreamForm from "components/views/group/admin/events/detail/form/LivestreamForm"
import LivestreamFormikProvider from "components/views/group/admin/events/detail/form/LivestreamFormikProvider"
import LivestreamAdminDetailTopBarNavigation from "components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import LivestreamFetchWrapper from "../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"

const LivestreamAdminDetailsPage = () => {
   const {
      query: { groupId, livestreamId },
   } = useRouter()

   if (!groupId) return null

   return (
      <LivestreamFetchWrapper livestreamId={livestreamId as string}>
         {(livestream) => (
            <LivestreamFormikProvider
               livestream={livestream}
               groupId={groupId as string}
            >
               <LivestreamCreationContextProvider>
                  <GroupDashboardLayout
                     titleComponent={"Live stream Details"}
                     groupId={groupId as string}
                     topBarCta={<LivestreamButtonActions />}
                     topBarNavigation={
                        <LivestreamAdminDetailTopBarNavigation />
                     }
                     bottomBarNavigation={
                        <LivestreamAdminDetailBottomBarNavigation />
                     }
                     backgroundColor="#FDFDFD"
                  >
                     <DashboardHead title="CareerFairy | Editing Live Stream of " />
                     <LivestreamForm />
                  </GroupDashboardLayout>
               </LivestreamCreationContextProvider>
            </LivestreamFormikProvider>
         )}
      </LivestreamFetchWrapper>
   )
}

export default LivestreamAdminDetailsPage

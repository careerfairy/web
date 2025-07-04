import useAdminGroup from "components/custom-hook/useAdminGroup"
import { LivestreamAutoSaveContextProvider } from "components/views/group/admin/events/detail/LivestreamAutoSaveContext"
import { LivestreamCreationContextProvider } from "components/views/group/admin/events/detail/LivestreamCreationContext"
import { LivestreamTopActions } from "components/views/group/admin/events/detail/LivestreamTopActions"
import LivestreamForm from "components/views/group/admin/events/detail/form/LivestreamForm"
import LivestreamFormikProvider from "components/views/group/admin/events/detail/form/LivestreamFormikProvider"
import LivestreamAdminDetailTopBarNavigation from "components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { useRouter } from "next/router"
import LivestreamFetchWrapper from "../../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"

const LivestreamAdminDetailsPage = () => {
   const {
      query: { groupId, livestreamId },
   } = useRouter()

   const { group } = useAdminGroup(groupId as string)

   if (!groupId || !group) return null

   return (
      <LivestreamFetchWrapper livestreamId={livestreamId as string}>
         {(livestream) => (
            <LivestreamFormikProvider livestream={livestream} group={group}>
               <LivestreamCreationContextProvider
                  livestream={livestream}
                  group={group}
               >
                  <LivestreamAutoSaveContextProvider>
                     <GroupDashboardLayout
                        titleComponent={"Live stream Details"}
                        topBarCta={<LivestreamTopActions />}
                        topBarMobileCta={<LivestreamTopActions />}
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
                  </LivestreamAutoSaveContextProvider>
               </LivestreamCreationContextProvider>
            </LivestreamFormikProvider>
         )}
      </LivestreamFetchWrapper>
   )
}

export default LivestreamAdminDetailsPage

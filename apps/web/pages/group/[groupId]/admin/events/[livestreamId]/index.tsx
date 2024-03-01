import { useState } from "react"
import { useRouter } from "next/router"
import GroupDashboardLayout from "layouts/GroupDashboardLayout"
import DashboardHead from "layouts/GroupDashboardLayout/DashboardHead"
import { LivestreamButtonActions } from "components/views/admin/livestream/LivestreamButtonActions"
import LivestreamAdminDetailTopBarNavigation, {
   TAB_VALUES,
} from "../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailTopBarNavigation"
import LivestreamFetchWrapper from "../../../../../../components/views/group/admin/events/detail/LivestreamFetchWrapper"
import LivestreamAdminDetailBottomBarNavigation from "../../../../../../components/views/group/admin/events/detail/navigation/LivestreamAdminDetailBottomBarNavigation"
import LivestreamCreationForm from "components/views/group/admin/events/detail/form"

const LivestreamAdminDetailsPage = () => {
   const {
      query: { groupId, livestreamId },
   } = useRouter()

   const [tabValue, setTabValue] = useState(TAB_VALUES.GENERAL)

   const handleTabChange = (_, newValue) => {
      setTabValue(newValue)
   }

   return (
      <GroupDashboardLayout
         titleComponent={"Live stream Details"}
         groupId={groupId as string}
         topBarCta={<LivestreamButtonActions />} // TODO to be implemented properly in CF-527
         topBarNavigation={
            <LivestreamAdminDetailTopBarNavigation
               tabValue={tabValue}
               tabOnChange={handleTabChange}
            />
         }
         bottomBarNavigation={
            <LivestreamAdminDetailBottomBarNavigation
               currentTab={tabValue}
               changeTab={setTabValue}
            />
         }
         backgroundColor="#FDFDFD"
      >
         <DashboardHead title="CareerFairy | Editing Live Stream of " />
         <LivestreamFetchWrapper livestreamId={livestreamId as string}>
            {(livestream) => (
               <LivestreamCreationForm
                  livestream={livestream}
                  groupId={groupId as string}
                  tabValue={tabValue}
               />
            )}
         </LivestreamFetchWrapper>
      </GroupDashboardLayout>
   )
}

export default LivestreamAdminDetailsPage

import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import { useRouter } from "next/router"
import { EventsOverview } from "../../../../../../components/views/group/admin/events"
import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"

const EventsPage = () => {
   const {
      query: { groupId },
   } = useRouter()

   return (
      <GroupDashboardLayout
         titleComponent={"Content"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Admin Live Streams of" />
         <SubNavigationTabs showSubNavigationFor="content" />
         <EventsOverview />
      </GroupDashboardLayout>
   )
}

export default EventsPage

import { SubNavigationTabs } from "layouts/GroupDashboardLayout/SubNavigationTabs"
import { EventsOverview } from "../../../../../../components/views/group/admin/events"
import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"

const EventsPage = () => {
   return (
      <GroupDashboardLayout titleComponent={"Content"}>
         <DashboardHead title="CareerFairy | Admin Live Streams of" />
         <SubNavigationTabs showSubNavigationFor="content" />
         <EventsOverview />
      </GroupDashboardLayout>
   )
}

export default EventsPage

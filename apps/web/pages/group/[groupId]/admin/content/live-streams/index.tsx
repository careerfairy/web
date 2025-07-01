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
         titleComponent={"Live Streams"}
         groupId={groupId as string}
      >
         <DashboardHead title="CareerFairy | Admin Live Streams of" />
         <EventsOverview />
      </GroupDashboardLayout>
   )
}

export default EventsPage

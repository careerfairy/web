import GroupDashboardLayout from "../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../layouts/GroupDashboardLayout/DashboardHead"
import EventsOverview from "../../../../../components/views/group/admin/events"

const EventsPage = ({ groupId }) => {
   return (
      <GroupDashboardLayout titleComponent={"Live Streams"} groupId={groupId}>
         <DashboardHead title="CareerFairy | Admin Upcoming Streams of" />
         <EventsOverview />
      </GroupDashboardLayout>
   )
}
export async function getServerSideProps(context) {
   const { groupId } = context.params
   return {
      props: {
         groupId,
      },
   }
}
export default EventsPage

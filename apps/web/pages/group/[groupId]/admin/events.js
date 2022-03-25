import React from "react"
import GroupDashboardLayout from "../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../layouts/GroupDashboardLayout/DashboardHead"
import EventsOverview from "../../../../components/views/group/admin/events"

const EventsPage = () => {
   return (
      <GroupDashboardLayout>
         <DashboardHead title="CareerFairy | Admin Upcoming Streams of" />
         <EventsOverview />
      </GroupDashboardLayout>
   )
}

export default EventsPage

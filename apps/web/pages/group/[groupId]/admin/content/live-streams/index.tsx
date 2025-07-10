import { ReactElement } from "react"
import { EventsOverview } from "../../../../../../components/views/group/admin/events"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const EventsPage = () => {
   return <EventsOverview />
}

EventsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      dashboardHeadTitle: "CareerFairy | Admin Live Streams of",
      subNavigationFor: "content",
   })(page)
}

export default EventsPage

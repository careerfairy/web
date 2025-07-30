import { ReactElement } from "react"
import { useFeatureFlags } from "../../../../../../components/custom-hook/useFeatureFlags"
import { EventsOverview } from "../../../../../../components/views/group/admin/events"
import { NewEventsOverview } from "../../../../../../components/views/group/admin/events/NewEventsOverview"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const EventsPage = () => {
   const { newEventsTableFlag } = useFeatureFlags()

   return newEventsTableFlag ? <NewEventsOverview /> : <EventsOverview />
}

EventsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Content",
      dashboardHeadTitle: "CareerFairy | Admin Live Streams of",
      subNavigationFor: "content",
   })(page)
}

export default EventsPage

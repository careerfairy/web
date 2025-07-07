import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import SparksDialog from "components/views/admin/sparks/sparks-dialog/SparksDialog"
import { Fragment, ReactElement } from "react"
import { withGroupDashboardLayout } from "../../../../../../layouts/GroupDashboardLayout/withGroupDashboardLayout"

const CreateSparkButtonWrapper = () => {
   return (
      <Fragment>
         <CreateSparkButton />
         <SparksDialog />
      </Fragment>
   )
}

const AdminSparksAnalyticsPage = () => {
   return (
      <SparksAnalyticsProvider>
         <GroupSparkAnalytics />
      </SparksAnalyticsProvider>
   )
}

AdminSparksAnalyticsPage.getLayout = function getLayout(page: ReactElement) {
   return withGroupDashboardLayout({
      titleComponent: "Analytics",
      topBarCta: <CreateSparkButtonWrapper />,
      dashboardHeadTitle: "CareerFairy | My Sparks Analytics",
      subNavigationFor: "analytics",
   })(page)
}

export default AdminSparksAnalyticsPage

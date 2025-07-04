import GroupSparkAnalytics from "components/views/admin/sparks/analytics"
import { SparksAnalyticsProvider } from "components/views/admin/sparks/analytics/SparksAnalyticsContext"
import CreateSparkButton from "components/views/admin/sparks/components/CreateSparkButton"
import SparksDialog from "components/views/admin/sparks/sparks-dialog/SparksDialog"
import { Fragment } from "react"
import GroupDashboardLayout from "../../../../../../layouts/GroupDashboardLayout"
import DashboardHead from "../../../../../../layouts/GroupDashboardLayout/DashboardHead"
import { SubNavigationTabs } from "../../../../../../layouts/GroupDashboardLayout/SubNavigationTabs"

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
      <GroupDashboardLayout
         titleComponent={"Analytics"}
         topBarCta={<CreateSparkButtonWrapper />}
      >
         <DashboardHead title="CareerFairy | My Sparks Analytics" />
         <SubNavigationTabs showSubNavigationFor="analytics" />
         <SparksAnalyticsProvider>
            <GroupSparkAnalytics />
         </SparksAnalyticsProvider>
      </GroupDashboardLayout>
   )
}

export default AdminSparksAnalyticsPage

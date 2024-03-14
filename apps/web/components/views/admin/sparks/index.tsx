import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import EmptySparksView from "./empty-sparks-view/EmptySparksView"
import GeneralSparksView from "./general-sparks-view/GeneralSparksView"
import SparksDialog from "./sparks-dialog/SparksDialog"
import SparksOnboardingDialog from "./sparks-onboarding-dialog/SparksOnboardingDialog"
import UpgradePlanBanner from "components/views/checkout/forms/UpgradePlanBanner"
import { SPARKS_1_YEAR_SUBSCRIPTION_CONFIG } from "data/stripe/stripe"

const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback="Loading...">
         <SparksComponent />
      </SuspenseWithBoundary>
   )
}

const BANNER_TITLE = "Reignite your Sparks and keep the momentum going!"
const BANNER_DESCRIPTION =
   "Your Sparks trial has ended, and they're no longer visible to the CareerFairy talent community. But the magic doesn't have to stop! Upgrade now and reignite the spark to continue engaging all year round with your target audience, access in-depth analytics and showcase your job opportunities in an innovative way. Don't let the momentum you built fade, upgrade now and reignite the spark!"
const SparksComponent = () => {
   const { group } = useGroup()
   const groupHasSparks = useGroupHasSparks(group.id)

   return (
      <Fragment>
         <UpgradePlanBanner
            productConfig={SPARKS_1_YEAR_SUBSCRIPTION_CONFIG}
            title={BANNER_TITLE}
            description={BANNER_DESCRIPTION}
         />
         {groupHasSparks ? <GeneralSparksView /> : <EmptySparksView />}
         <SparksDialog />
         <SparksOnboardingDialog />
      </Fragment>
   )
}

export default Sparks

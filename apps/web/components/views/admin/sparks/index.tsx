import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupHasSparks from "components/custom-hook/spark/useGroupHasSparks"
import { useGroup } from "layouts/GroupDashboardLayout"
import { Fragment } from "react"
import EmptySparksView from "./empty-sparks-view/EmptySparksView"
import GeneralSparksView from "./general-sparks-view/GeneralSparksView"
import SparksDialog from "./sparks-dialog/SparksDialog"
import SparksOnboardingDialog from "./sparks-onboarding-dialog/SparksOnboardingDialog"
import useGroupPlanIsValid from "components/custom-hook/group/useGroupPlanIsValid"
import UpgradePlanBanner from "components/views/checkout/forms/UpgradePlanBanner"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { SPARKS_1_YEAR_SUBSCRIPTION_CONFIG } from "data/stripe/stripe"

const Sparks = () => {
   return (
      <SuspenseWithBoundary fallback="Loading...">
         <SparksComponent />
      </SuspenseWithBoundary>
   )
}

const SparksComponent = () => {
   const { group } = useGroup()
   const planStatus = useGroupPlanIsValid(group.groupId, ["trial"])
   const groupHasSparks = useGroupHasSparks(group.id)

   return (
      <Fragment>
         <ConditionalWrapper condition={!planStatus.valid}>
            <UpgradePlanBanner
               productConfig={SPARKS_1_YEAR_SUBSCRIPTION_CONFIG}
            />
         </ConditionalWrapper>
         {groupHasSparks ? <GeneralSparksView /> : <EmptySparksView />}
         <SparksDialog />
         <SparksOnboardingDialog />
      </Fragment>
   )
}

export default Sparks

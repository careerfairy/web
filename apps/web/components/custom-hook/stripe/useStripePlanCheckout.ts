import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/dist/groups/planConstants"
import { Group, GroupPlanType } from "@careerfairy/shared-lib/groups/groups"
import {
   GroupPlanFetchStripeCustomerSession,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { useAuth } from "HOCs/AuthProvider"
import { useSparksPlansForm } from "components/views/checkout/GroupPlansDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FormEvent } from "react"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import { useStripeCustomerSession } from "./useStripeCustomerSession"

const useStripePlanCheckout = () => {
   const { authenticatedUser } = useAuth()
   const { group } = useGroup()
   const { goToCheckoutView: goToSelectPlanView, setClientSecret } =
      useSparksPlansForm()

   const selectedPlan = useSelector(selectedPlanSelector)

   const sessionOptions = getSessionOptions(
      group,
      selectedPlan,
      authenticatedUser.email
   )

   const {
      data: customerSession,
      isLoading: loadingSecret,
      error: error,
   } = useStripeCustomerSession(sessionOptions)

   const disabled =
      !selectedPlan ||
      loadingSecret ||
      error ||
      !customerSession.customerSessionSecret
   const redirectToCheckout = async (e: FormEvent) => {
      e.preventDefault()

      setClientSecret(customerSession.customerSessionSecret)
      goToSelectPlanView(selectedPlan)
   }

   return {
      disabled: disabled,
      redirectToCheckout: redirectToCheckout,
   }
}

const getSessionOptions = (
   group: Group,
   selectedPlan: GroupPlanType,
   userEmail: string
): GroupPlanFetchStripeCustomerSession => {
   return {
      type: StripeProductType.GROUP_PLAN,
      plan: selectedPlan,
      customerEmail: userEmail,
      groupId: group.groupId,
      customerName: group.universityName,
      priceId: PLAN_CONSTANTS[selectedPlan].stripe.priceId(
         group.companyCountry?.id
      ),
      successUrl: `/group/${group.groupId}/admin/sparks?stripe_session_id={CHECKOUT_SESSION_ID}&planName=${PLAN_CONSTANTS[selectedPlan].name}`,
   }
}

export default useStripePlanCheckout

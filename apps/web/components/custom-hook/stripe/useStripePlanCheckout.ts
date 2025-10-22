import { PLAN_CONSTANTS } from "@careerfairy/shared-lib/groups/planConstants"
import { StripeProductType } from "@careerfairy/shared-lib/stripe/types"
import { useAuth } from "HOCs/AuthProvider"
import { useSparksPlansForm } from "components/views/checkout/GroupPlansDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { FormEvent } from "react"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import { useStripeCustomerSession } from "./useStripeCustomerSession"

const useStripePlanCheckout = () => {
   const { userData } = useAuth()
   const { group } = useGroup()
   const { goToCheckoutView: goToSelectPlanView, setClientSecret } =
      useSparksPlansForm()

   const selectedPlan = useSelector(selectedPlanSelector)

   const {
      data: customerSession,
      isLoading: loadingSecret,
      error: error,
   } = useStripeCustomerSession({
      type: StripeProductType.GROUP_PLAN,
      plan: selectedPlan,
      customerEmail: userData.userEmail,
      customerName: `${userData.firstName} ${userData.lastName}`,
      groupId: group.groupId,
      priceId: PLAN_CONSTANTS[selectedPlan].stripe.priceId(
         group.companyCountry?.id
      ),
      successUrl: `/group/${group.groupId}/admin/sparks?stripe_session_id={CHECKOUT_SESSION_ID}&planName=${PLAN_CONSTANTS[selectedPlan].name}`,
   })

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

export default useStripePlanCheckout

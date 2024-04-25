import { useAuth } from "HOCs/AuthProvider"
import { useSparksPlansForm } from "components/views/checkout/GroupPlansDialog"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import useStripeCustomerSession from "./useStripeCustomerSession"
import { FormEvent } from "react"

const useStripePlanCheckout = () => {
   const { authenticatedUser } = useAuth()
   const { group } = useGroup()
   const { goToCheckoutView: goToSelectPlanView, setClientSecret } =
      useSparksPlansForm()

   const selectedPlan = useSelector(selectedPlanSelector)

   const {
      customerSessionSecret: customerSessionSecret,
      loading: loadingSecret,
      error: error,
   } = useStripeCustomerSession(group, selectedPlan, authenticatedUser.email)
   const disabled =
      !selectedPlan || loadingSecret || error || !customerSessionSecret
   const redirectToCheckout = async (e: FormEvent) => {
      e.preventDefault()

      setClientSecret(customerSessionSecret)
      goToSelectPlanView(selectedPlan)
   }

   return {
      disabled: disabled,
      redirectToCheckout: redirectToCheckout,
   }
}

export default useStripePlanCheckout

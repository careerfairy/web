import { Stripe, loadStripe } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null>
const getStripe = () => {
   if (!stripePromise) {
      stripePromise = loadStripe(
         process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      )
   }
   return stripePromise
}

// TODO: Check if could be in a better folder
// Other enhancements can be done for further securing the products to be used more safely
type StripeProductConfig = {
   mode: "button" | "embedded"
   publishableKey: string
}

export type StripeButtonProductConfig = StripeProductConfig & {
   mode: "button"
   buttonId: string
   publishableKey: string
}

export const SPARKS_1_YEAR_SUBSCRIPTION_CONFIG: StripeButtonProductConfig = {
   mode: "button",
   buttonId: process.env.NEXT_PUBLIC_SPARKS_STRIPE_1_YEAR_BUY_BUTTON_ID,
   publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
}
export default getStripe

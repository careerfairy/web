import { Stripe } from "stripe"

export const getTotalQuantityFromCheckoutSession = (
   session: Stripe.Checkout.Session
) => {
   const lineItems = session.line_items?.data || []
   let totalQuantity = 0

   lineItems.forEach((item) => {
      const quantity = item.quantity || 0
      totalQuantity += quantity
   })

   return totalQuantity
}

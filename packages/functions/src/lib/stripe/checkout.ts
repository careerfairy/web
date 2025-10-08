import { BaseStripeSessionMetadata } from "@careerfairy/shared-lib/stripe/types"
import stripeInstance from "."

interface CreateCheckoutSessionParams<T extends BaseStripeSessionMetadata> {
   customerId: string
   returnUrl: string
   priceId: string
   adjustableQuantity?: boolean
   metadata: T
}

export const createCheckoutSession = <T extends BaseStripeSessionMetadata>(
   options: CreateCheckoutSessionParams<T>
) => {
   return stripeInstance.checkout.sessions.create({
      customer: options.customerId,
      return_url: options.returnUrl,
      line_items: [
         {
            price: options.priceId,
            quantity: 1,
            ...(options.adjustableQuantity
               ? {
                    adjustable_quantity: {
                       enabled: true,
                       minimum: 1,
                    },
                 }
               : {}),
         },
      ],
      ui_mode: "embedded",
      mode: "payment",
      billing_address_collection: "required",
      metadata: options.metadata as unknown as Record<string, string>,
      invoice_creation: {
         enabled: true,
      },
   })
}

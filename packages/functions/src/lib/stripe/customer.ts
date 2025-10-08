import {
   BaseSessionPayload,
   STRIPE_CUSTOMER_METADATA_VERSION,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import stripeInstance from "."
import functions = require("firebase-functions")

/**
 * Creates or updates a Stripe customer for the given group
 * Returns the customer object.
 *
 * Its advised to not influence the customerId of the customer object. So the metadata.groupId is used to identify the customer.
 *  - If needed the created customerId can be synched into the Group document.
 */
export const createOrUpdateStripeCustomer = async (
   payload: BaseSessionPayload
): Promise<Stripe.Customer> => {
   const { groupId, customerName, customerEmail } = payload

   const query = `metadata['groupId']:'${groupId}'`

   const customers = await stripeInstance.customers.search({
      query: query,
   })

   let groupCustomer = customers?.data?.at(0)

   const createCustomer = !groupCustomer

   if (createCustomer) {
      groupCustomer = await stripeInstance.customers.create({
         name: customerName,
         email: customerEmail,
         metadata: {
            groupId: groupId,
            version: STRIPE_CUSTOMER_METADATA_VERSION,
         },
      })
      functions.logger.info("Created customer:", groupCustomer)
   } else {
      groupCustomer = await stripeInstance.customers.update(groupCustomer.id, {
         metadata: {
            groupId: groupId,
            version: STRIPE_CUSTOMER_METADATA_VERSION,
         },
      })
   }

   return groupCustomer
}

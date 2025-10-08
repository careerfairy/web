import {
   BaseSessionPayload,
   BaseStripeSessionMetadata,
   CreateCheckoutSessionParams,
   STRIPE_CUSTOMER_METADATA_VERSION,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import functions = require("firebase-functions")

export interface IStripeFunctionsRepository {
   createCheckoutSession<T extends BaseStripeSessionMetadata>(
      options: CreateCheckoutSessionParams<T>
   ): Promise<Stripe.Checkout.Session>

   /**
    * Creates or updates a Stripe customer, with the customer id being set in the metadata.groupId, allowing for the
    * default Stripe id to be untouched.
    *
    * Retrieving the same customer, can be done by querying the customer with the metadata.groupId. If needed,
    * the created customerId can be synched into the Group document.
    */
   createOrUpdateStripeCustomer(
      payload: BaseSessionPayload
   ): Promise<Stripe.Customer>

   /**
    * Retrieves the total quantity from a checkout session by its id, using the expand parameter to get the line items and
    * perform the calculation.
    */
   getTotalQuantityFromCheckoutSessionById(sessionId: string): Promise<number>

   getTotalQuantityFromCheckoutSession(session: Stripe.Checkout.Session): number
   stripe: Stripe
}

export class StripeFunctionsRepository implements IStripeFunctionsRepository {
   constructor(private _stripe: Stripe) {}

   get stripe(): Stripe {
      return this._stripe
   }

   /**
    * Creates a Stripe checkout session
    */
   async createCheckoutSession<T extends BaseStripeSessionMetadata>(
      options: CreateCheckoutSessionParams<T>
   ): Promise<Stripe.Checkout.Session> {
      return this._stripe.checkout.sessions.create({
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

   /**
    * Creates or updates a Stripe customer for the given group
    * Returns the customer object.
    *
    * Its advised to not influence the customerId of the customer object. So the metadata.groupId is used to identify the customer.
    *  - If needed the created customerId can be synched into the Group document.
    */
   async createOrUpdateStripeCustomer(
      payload: BaseSessionPayload
   ): Promise<Stripe.Customer> {
      const { groupId, customerName, customerEmail } = payload

      const query = `metadata['groupId']:'${groupId}'`

      const customers = await this._stripe.customers.search({
         query: query,
      })

      let groupCustomer = customers?.data?.at(0)

      const createCustomer = !groupCustomer

      if (createCustomer) {
         groupCustomer = await this._stripe.customers.create({
            name: customerName,
            email: customerEmail,
            metadata: {
               groupId: groupId,
               version: STRIPE_CUSTOMER_METADATA_VERSION,
            },
         })
         functions.logger.info("Created customer:", groupCustomer)
      } else {
         groupCustomer = await this._stripe.customers.update(groupCustomer.id, {
            metadata: {
               groupId: groupId,
               version: STRIPE_CUSTOMER_METADATA_VERSION,
            },
         })
      }

      return groupCustomer
   }

   async getTotalQuantityFromCheckoutSessionById(
      sessionId: string
   ): Promise<number> {
      const session = await this._stripe.checkout.sessions.retrieve(sessionId, {
         expand: ["line_items"],
      })

      return this.getTotalQuantityFromCheckoutSession(session)
   }

   // Utility functions

   /**
    * Calculates the total quantity from a checkout session's line items
    */
   getTotalQuantityFromCheckoutSession(
      session: Stripe.Checkout.Session
   ): number {
      const lineItems = session.line_items?.data || []

      return lineItems.reduce((acc, item) => acc + (item.quantity || 0), 0)
   }
}

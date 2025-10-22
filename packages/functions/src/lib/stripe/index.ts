import {
   BaseSessionPayload,
   BaseStripeSessionMetadata,
   CreateCheckoutSessionParams,
   STRIPE_CUSTOMER_METADATA_VERSION,
} from "@careerfairy/shared-lib/stripe/types"
import { Stripe } from "stripe"
import { groupRepo } from "../../api/repositories"
import functions = require("firebase-functions")

export interface IStripeFunctionsRepository {
   createCheckoutSession<T extends BaseStripeSessionMetadata>(
      options: CreateCheckoutSessionParams<T>
   ): Promise<Stripe.Checkout.Session>

   /**
    * Creates or updates a Stripe customer, with the customer id being set in the metadata.groupId, allowing for the
    * default Stripe id to be untouched. Its recommended to not influence the customerId of the customer object.
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

   retrievePrice(priceId: string): Promise<Stripe.Price>

   retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session>

   retrieveCustomer(customerId: string): Promise<Stripe.Customer>

   constructWebhookEvent(
      payload: string | Buffer,
      signature: string,
      secret: string
   ): Stripe.Event
}

export class StripeFunctionsRepository implements IStripeFunctionsRepository {
   constructor(private _stripe: Stripe) {}

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

   async createOrUpdateStripeCustomer(
      payload: BaseSessionPayload
   ): Promise<Stripe.Customer> {
      const { groupId } = payload

      const group = await groupRepo.getGroupById(groupId)

      const query = `metadata['groupId']:'${group.id}'`

      const customers = await this._stripe.customers.search({
         query: query,
      })

      let groupCustomer = customers?.data?.at(0)

      const createCustomer = !groupCustomer

      if (createCustomer) {
         groupCustomer = await this._stripe.customers
            .create({
               name: group.universityName,
               metadata: {
                  groupId: group.id,
                  version: STRIPE_CUSTOMER_METADATA_VERSION,
               },
            })
            .then(async (customer) => {
               await groupRepo
                  .updateGroupData(group.id, {
                     stripeCustomerId: customer.id,
                  })
                  .catch((error) => {
                     functions.logger.error(
                        "Error updating group data with stripe customer id: ",
                        error
                     )
                  })

               return customer
            })

         functions.logger.info(
            `Created customer: ${groupCustomer.id} for group ${group.id}`,
            groupCustomer
         )
      } else {
         groupCustomer = await this._stripe.customers.update(groupCustomer.id, {
            metadata: {
               groupId: group.id,
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

      return getTotalQuantityFromCheckoutSession(session)
   }

   async retrievePrice(priceId: string): Promise<Stripe.Price> {
      return this._stripe.prices.retrieve(priceId)
   }

   async retrieveCheckoutSession(
      sessionId: string
   ): Promise<Stripe.Checkout.Session> {
      return this._stripe.checkout.sessions.retrieve(sessionId)
   }

   async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
      const customer = await this._stripe.customers.retrieve(customerId)
      if (customer.deleted) {
         throw new Error(`Customer ${customerId} has been deleted`)
      }
      return customer as Stripe.Customer
   }

   constructWebhookEvent(
      payload: string | Buffer,
      signature: string,
      secret: string
   ): Stripe.Event {
      return Stripe.webhooks.constructEvent(payload, signature, secret)
   }
}

// Utility functions

const getTotalQuantityFromCheckoutSession = (
   session: Stripe.Checkout.Session
): number => {
   const lineItems = session.line_items?.data || []

   return lineItems.reduce((acc, item) => acc + (item.quantity || 0), 0)
}

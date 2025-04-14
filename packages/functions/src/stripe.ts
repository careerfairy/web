import { GroupPlanType, GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { GlobalOptions } from "firebase-functions"
import { onCall, onRequest } from "firebase-functions/v2/https"
import { Stripe } from "stripe"
import { SchemaOf, mixed, object, string } from "yup"
import { groupRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { setCORSHeaders } from "./util"
import functions = require("firebase-functions")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

/**
 * Payload for retrieving Stripe Price information
 */
type FetchStripePrice = {
   groupId: string
   priceId: string
}

/**
 * Payload for creating a Stripe customer session, returning the client secret.
 * For retrieving the secret it is necessary to provide a customer ID, so a customer will be created
 * if not existing and updating if already present.
 */
type FetchStripeCustomerSession = {
   customerName: string
   customerEmail: string
   groupId: string
   plan: GroupPlanType
   priceId: string
   successUrl: string
}

/**
 * Payload for fetching Stripe session status, allows to determine if a checkout was complete and paid.
 * Receives the session ID provided from stripe via the return_url
 */
type FetchStripeSessionStatus = {
   sessionId: string
   groupId: string
}

const STRIPE_CUSTOMER_METADATA_VERSION = "0.1"
const STRIPE_CUSTOMER_SESSION_METADATA_VERSION = "0.1"

/**
 * Functions runtime settings
 */
const runtimeSettings: GlobalOptions = {
   memory: "256MiB",
}

const fetchStripePriceSchema: SchemaOf<FetchStripePrice> = object().shape({
   groupId: string().required(),
   priceId: string().required(),
})

const fetchStripeCustomerSessionSchema: SchemaOf<FetchStripeCustomerSession> =
   object().shape({
      plan: mixed().oneOf(Object.values(GroupPlanTypes)).required(),
      customerName: string().required(),
      customerEmail: string().required(),
      groupId: string().required(),
      customerId: string().required(),
      priceId: string().required(),
      successUrl: string().required(),
   })

const fetchStripeSessionStatusSchema: SchemaOf<FetchStripeSessionStatus> =
   object().shape({
      sessionId: string().required(),
      groupId: string().required(),
   })

/**
 * Fetches a Stripe Customer Session, if the customer does not exist, a new one will be created.
 * Customers are identified by their metadata.groupId
 */
export const fetchStripeCustomerSession = onCall(
   runtimeSettings,
   middlewares<FetchStripeCustomerSession>(
      dataValidation(fetchStripeCustomerSessionSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         const data = request.data
         functions.logger.info("fetchStripeCustomerSession - data: ", data)

         const returnUrl = request.rawRequest.headers.origin + data.successUrl

         try {
            const query = `metadata['groupId']:'${data.groupId}'`

            const customers = await stripe.customers.search({
               query: query,
            })

            const notDeleted = customers?.data?.filter((c) => !c.deleted)

            let groupCustomer = notDeleted?.length
               ? notDeleted.at(0)
               : undefined

            const createCustomer = groupCustomer === undefined

            if (createCustomer) {
               groupCustomer = await stripe.customers.create({
                  name: data.customerName,
                  email: data.customerEmail,
                  metadata: {
                     groupId: data.groupId,
                     version: STRIPE_CUSTOMER_METADATA_VERSION,
                  },
               })
               functions.logger.info("Created customer:", groupCustomer)
            } else {
               groupCustomer = await stripe.customers.update(groupCustomer.id, {
                  metadata: {
                     groupId: data.groupId,
                     version: STRIPE_CUSTOMER_METADATA_VERSION,
                  },
               })
            }

            const customerSession = await stripe.checkout.sessions.create({
               customer: groupCustomer.id,
               return_url: returnUrl,
               line_items: [
                  {
                     price: data.priceId,
                     quantity: 1,
                  },
               ],
               ui_mode: "embedded",
               mode: "payment",
               billing_address_collection: "required",
               metadata: {
                  groupId: data.groupId,
                  userEmail: data.customerEmail,
                  plan: data.plan,
                  version: STRIPE_CUSTOMER_SESSION_METADATA_VERSION,
               },
               invoice_creation: {
                  enabled: true,
               },
            })

            return { customerSessionSecret: customerSession.client_secret }
         } catch (error) {
            console.log(error)
            logAndThrow("Error while creating Stripe Customer Session", {
               data,
               error,
               request,
            })
         }
      }
   )
)

/**
 * Fetch Stripe Price via ID using the Stripe API. Receives requests with data
 */
export const fetchStripePrice = onCall(
   runtimeSettings,
   middlewares<FetchStripePrice>(
      dataValidation(fetchStripePriceSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         functions.logger.info(
            "fetchStripePrice - priceId: ",
            request.data.priceId
         )

         try {
            const price = await stripe.prices.retrieve(request.data.priceId)

            return price
         } catch (error) {
            logAndThrow("Error while retrieving Stripe price by ID", {
               error,
               request,
            })
         }
      }
   )
)

/**
 * Fetches Session status from Stripe API, returning null if any exception occurs (invalid id or other)
 */
export const fetchStripeSessionStatus = onCall(
   runtimeSettings,
   middlewares<FetchStripeSessionStatus>(
      dataValidation(fetchStripeSessionStatusSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         functions.logger.info(
            "fetchStripeSession by ID - session id: ",
            request.data.sessionId
         )

         try {
            const session = await stripe.checkout.sessions.retrieve(
               request.data.sessionId
            )
            const customer = await stripe.customers.retrieve(session.customer)

            return {
               status: session.status,
               paymentStatus: session.payment_status,
               customerEmail: customer.email,
            }
         } catch (error) {
            functions.logger.error(
               "Error while retrieving Stripe Session Status by ID",
               request,
               error
            )
            return null
         }
      }
   )
)

export const stripeWebHook = onRequest(
   runtimeSettings,
   async (request, response) => {
      setCORSHeaders(request, response)
      if (request.method !== "POST") {
         response.status(400).send("Only POST requests are allowed")
         return
      }

      const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET

      if (request.method === "POST") {
         const buffer = request.rawBody

         const signature = request.headers["stripe-signature"]

         let event: Stripe.Event = null

         try {
            event = Stripe.webhooks.constructEvent(
               buffer,
               signature,
               webhookSecret
            )

            await handleStripeEvent(event)
         } catch (error) {
            functions.logger.info("Error handling Stripe Event :", error)
            response.status(400).send(`Webhook Error: ${error}`)
            return
         }
         response.json({ received: true })
      } else {
         functions.logger.info(
            "Invalid request method, only POST accepted:",
            request
         )
         response.json({ received: false })
      }
   }
)

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
   try {
      functions.logger.info("handleStripeEvent ~ event:", event)
      switch (event.type) {
         case "checkout.session.completed": {
            const paymentSucceedEvent =
               event as Stripe.CheckoutSessionCompletedEvent

            const metadata = paymentSucceedEvent.data.object.metadata
            if (metadata && metadata.groupId && metadata.plan) {
               const plan = metadata.plan as GroupPlanType
               await groupRepo.startPlan(metadata.groupId, plan)

               functions.logger.info(
                  "✅ Successfully processed event - Stripe Customer: " +
                     JSON.stringify(metadata) +
                     ", Group ID: ",
                  metadata.groupId
               )
            } else {
               functions.logger.error(
                  "Could not process Stripe event checkout.session.completed based on metadata: ",
                  metadata
               )
            }
            break
         }

         default: {
            break
         }
      }
   } catch (error) {
      functions.logger.info("Error processing Stripe event: ", error)
   }
}

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import {
   BaseSessionPayload,
   StripeCustomerSessionData,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { GlobalOptions } from "firebase-functions"
import { onCall, onRequest } from "firebase-functions/v2/https"
import { Stripe } from "stripe"
import { SchemaOf, object, string } from "yup"
import { stripeRepo } from "./api/repositories"
import { EventHandlers } from "./lib/stripe/events"
import { sessionHandlers } from "./lib/stripe/sessions"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { setCORSHeaders } from "./util"
import functions = require("firebase-functions")

/**
 * Payload for retrieving Stripe Price information
 */
type FetchStripePrice = {
   groupId: string
   priceId: string
}

/**
 * Payload for fetching Stripe session status, allows to determine if a checkout was complete and paid.
 * Receives the session ID provided from stripe via the return_url
 */
type FetchStripeSessionStatus = {
   sessionId: string
   groupId: string
}

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

const fetchStripeCustomerSessionSchema = object().shape({
   type: string().oneOf(Object.values(StripeProductType)).required(),
   customerName: string().required(),
   customerEmail: string().required(),
   groupId: string().required(),
   priceId: string().required(),
   successUrl: string().required(),
   plan: string().when("type", {
      is: StripeProductType.GROUP_PLAN,
      then: (schema) => schema.oneOf(Object.values(GroupPlanTypes)).required(),
      otherwise: (schema) => schema.notRequired(),
   }),
})

const fetchStripeSessionStatusSchema: SchemaOf<FetchStripeSessionStatus> =
   object().shape({
      sessionId: string().required(),
      groupId: string().required(),
   })

/**
 * Fetches a Stripe Customer Session, if the customer does not exist, a new one will be created.
 * Customers are identified by their metadata.groupId
 * Supports multiple product types: group-plan, offline-event
 */
export const fetchStripeCustomerSession = onCall(
   runtimeSettings,
   middlewares<BaseSessionPayload>(
      dataValidation(fetchStripeCustomerSessionSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         const data = request.data
         functions.logger.info("AAARetrieve customer session: ", data)

         const returnUrl = request.rawRequest.headers.origin + data.successUrl

         try {
            // Create or update customer (shared logic)
            const groupCustomer = await stripeRepo.createOrUpdateStripeCustomer(
               data
            )

            // Create session based on product type using handler map
            const handler = sessionHandlers[data.type]

            if (!handler) {
               logAndThrow("Unsupported product type", {
                  data,
                  error: new Error("Unsupported product type"),
               })
            }

            const customerSession = await handler(
               groupCustomer.id,
               returnUrl,
               data as any // Type assertion should be safe here due to the handler map
            )

            return {
               customerSessionSecret: customerSession.client_secret,
            } as StripeCustomerSessionData
         } catch (error) {
            logAndThrow("Error while creating Stripe Customer Session", {
               data,
               error,
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
            return await stripeRepo.retrievePrice(request.data.priceId)
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
            const session = await stripeRepo.retrieveCheckoutSession(
               request.data.sessionId
            )
            await stripeRepo.retrieveCustomer(session.customer as string)

            return {
               status: session.status,
               paymentStatus: session.payment_status,
               customerEmail: session.customer_details.email,
            }
         } catch (error) {
            logAndThrow("Error while retrieving Stripe Session Status by ID", {
               error,
               request,
            })
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
            event = stripeRepo.constructWebhookEvent(
               buffer,
               signature as string,
               webhookSecret
            )

            const eventHandler =
               event.type in EventHandlers ? EventHandlers[event.type] : null

            if (eventHandler) {
               await eventHandler(event)
            } else {
               functions.logger.info(
                  "Event handler not found for event type:",
                  event.type
               )
            }
         } catch (error) {
            functions.logger.error("Error handling Stripe Event :", error)
            response.status(500).send(`Webhook Error: ${error}`)
            return
         }
         response.json({ received: true })
      } else {
         functions.logger.error(
            "Invalid request method, only POST accepted:",
            request
         )
         response.json({ received: false })
      }
   }
)

import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import {
   BaseSessionPayload,
   StripeCustomerSessionData,
   StripeEnvironments,
   StripeProductType,
} from "@careerfairy/shared-lib/stripe/types"
import { Response } from "express"
import { GlobalOptions } from "firebase-functions"
import {
   CallableRequest,
   Request,
   onCall,
   onRequest,
} from "firebase-functions/v2/https"
import { Stripe } from "stripe"
import { SchemaOf, object, string } from "yup"
import { stripeRepo } from "./api/repositories"
import { createEventHandlers } from "./lib/stripe/events"
import { IStripeFunctionsRepository } from "./lib/stripe/index"
import { createSessionHandlers } from "./lib/stripe/sessions"
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
 * Core function: Fetches a Stripe Customer Session
 * @param request - The callable request with data and headers
 * @param repo - The Stripe repository instance to use
 */
async function getStripeCustomerSession(
   request: CallableRequest<BaseSessionPayload>,
   repo: IStripeFunctionsRepository
): Promise<StripeCustomerSessionData> {
   const data = request.data
   functions.logger.info("Retrieve customer session: ", data)

   const returnUrl = request.rawRequest.headers.origin + data.successUrl

   try {
      // Create or update customer (shared logic)
      const groupCustomer = await repo.createOrUpdateStripeCustomer(data)

      // Create session based on product type using handler map
      const sessionHandlers = createSessionHandlers(repo)
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

/**
 * Core function: Fetches Stripe Price by ID
 * @param request - The callable request with data
 * @param repo - The Stripe repository instance to use
 */
async function getStripePrice(
   request: CallableRequest<FetchStripePrice>,
   repo: IStripeFunctionsRepository
): Promise<Stripe.Price> {
   const { priceId } = request.data
   functions.logger.info("fetchStripePrice - priceId: ", priceId)

   try {
      return await repo.retrievePrice(priceId)
   } catch (error) {
      logAndThrow("Error while retrieving Stripe price by ID", {
         error,
         request,
      })
   }
}

/**
 * Core function: Fetches Session status from Stripe API
 * @param request - The callable request with data
 * @param repo - The Stripe repository instance to use
 */
async function getStripeSessionStatus(
   request: CallableRequest<FetchStripeSessionStatus>,
   repo: IStripeFunctionsRepository
): Promise<{
   status: string
   paymentStatus: string
   customerEmail: string
}> {
   const { sessionId } = request.data
   functions.logger.info("fetchStripeSession by ID - session id: ", sessionId)

   try {
      const session = await repo.retrieveCheckoutSession(sessionId)
      await repo.retrieveCustomer(session.customer as string)

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

/**
 * Core function: Handles Stripe webhook events
 * @param request - The HTTP request object
 * @param response - The HTTP response object
 * @param webhookSecret - The webhook secret to validate the event
 * @param repo - The Stripe repository instance to use
 */
async function handleStripeWebhook(
   request: Request,
   response: Response,
   webhookSecret: string,
   repo: IStripeFunctionsRepository
): Promise<void> {
   setCORSHeaders(request, response)

   if (request.method !== "POST") {
      response.status(400).send("Only POST requests are allowed")
      return
   }

   const buffer = request.rawBody
   const signature = request.headers["stripe-signature"]

   try {
      const event = repo.constructWebhookEvent(
         buffer,
         signature as string,
         webhookSecret
      )

      const eventHandlers = createEventHandlers(repo)
      const eventHandler = eventHandlers[event.type]

      if (eventHandler) {
         await eventHandler(event)
      } else {
         functions.logger.info(
            "Event handler not found for event type:",
            event.type
         )
      }

      response.json({ received: true })
   } catch (error) {
      functions.logger.error("Error handling Stripe Event:", error)
      response.status(500).send(`Webhook Error: ${error}`)
   }
}

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
         return getStripeCustomerSession(
            request,
            stripeRepo[StripeEnvironments.Prod]
         )
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
         return getStripePrice(request, stripeRepo[StripeEnvironments.Prod])
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
         return getStripeSessionStatus(
            request,
            stripeRepo[StripeEnvironments.Prod]
         )
      }
   )
)

export const stripeWebHook = onRequest(
   runtimeSettings,
   async (request, response) => {
      const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET
      await handleStripeWebhook(
         request,
         response,
         webhookSecret,
         stripeRepo[StripeEnvironments.Prod]
      )
   }
)

// ============================================================================
// TEST VARIANTS - Using test Stripe account
// ============================================================================

/**
 * TEST: Fetches a Stripe Customer Session using the test Stripe account
 */
export const fetchStripeCustomerSessionTest = onCall(
   runtimeSettings,
   middlewares<BaseSessionPayload>(
      dataValidation(fetchStripeCustomerSessionSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         return getStripeCustomerSession(
            request,
            stripeRepo[StripeEnvironments.Test]
         )
      }
   )
)

/**
 * TEST: Fetch Stripe Price via ID using the test Stripe account
 */
export const fetchStripePriceTest = onCall(
   runtimeSettings,
   middlewares<FetchStripePrice>(
      dataValidation(fetchStripePriceSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         return getStripePrice(request, stripeRepo[StripeEnvironments.Test])
      }
   )
)

/**
 * TEST: Fetches Session status from test Stripe account
 */
export const fetchStripeSessionStatusTest = onCall(
   runtimeSettings,
   middlewares<FetchStripeSessionStatus>(
      dataValidation(fetchStripeSessionStatusSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         return getStripeSessionStatus(
            request,
            stripeRepo[StripeEnvironments.Test]
         )
      }
   )
)

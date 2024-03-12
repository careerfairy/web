import { RuntimeOptions } from "firebase-functions"
import functions = require("firebase-functions")
import config from "./config"
import { Stripe } from "stripe"
// import { stripe} from "stripe"
import { setCORSHeaders } from "./util"
import { groupRepo } from "./api/repositories"

/**
 * Functions runtime settings
 */
const runtimeSettings: RuntimeOptions = {
   // may take a while
   timeoutSeconds: 60,
   // we may load lots of data into memory
   memory: "128MB",
}

export const stripeWebHook = functions
   .region(config.region)
   .runWith(runtimeSettings)
   .https.onRequest(async (request, response) => {
      setCORSHeaders(request, response)
      if (request.method !== "POST") {
         response.status(400).send("Only POST requests are allowed")
         return
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!
      // functions.logger.info(
      //    "Starting Stripe WebHook"
      // )
      if (request.method === "POST") {
         const buf = request.rawBody
         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
         const sig = request.headers["stripe-signature"]!

         let event: Stripe.Event = null

         try {
            event = Stripe.webhooks.constructEvent(buf, sig, webhookSecret)

            await handleStripeEvent(event)
            console.log("🚀 ~ .onRequest ~ handled:", event)
         } catch (err) {
            // On error, log and return the error message
            // console.log(`❌ Error message: ${err.message}`)
            response.status(400).send(`Webhook Error: ${err}`)
            return
         }
      }

      //       const event = request.body;

      //   // Handle the event
      //   let paymentIntent
      //   let paymentMethod
      //   switch (event.type) {
      //     case "checkout.session.completed":
      //         console.log("🚀 ~ .https.onRequest ~ metadata", event.data.metadata)
      //         if(event.data.metadata)
      //         console.log("✅ Success:", event.id)
      //         // paymentIntent = event.data.object;
      //         // console.log("🚀 ~ .https.onRequest ~ paymentIntent:", paymentIntent)
      //       // Then define and call a method to handle the successful payment intent.
      //       // handlePaymentIntentSucceeded(paymentIntent);
      //       break;
      //     case "invoice.payment_succeeded":
      //       console.log("🚀 ~ .https.onRequest ~ metadata", event.data.metadata)
      //       // Then define and call a method to handle the successful attachment of a PaymentMethod.
      //       // handlePaymentMethodAttached(paymentMethod);
      //       // Successfully constructed event
      //         if(event.data.metadata)
      //         console.log("✅ Success:", event.id)
      //       break;
      //     // ... handle other event types
      //     default:
      //       console.log(`Unhandled event type ${event.type}`);
      //   }

      // Return a response to acknowledge receipt of the event

      response.json({ received: true })
   })

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
   switch (event.type) {
      case "checkout.session.completed": {
         const paymentSucceedEvent =
            event as Stripe.CheckoutSessionCompletedEvent
         // console.log("🚀 ~ handleStripeEvent ~ paymentSucceedEvent:", paymentSucceedEvent)
         const groupId = paymentSucceedEvent.data.object.customer as string
         console.log("🚀 ~ handleStripeEvent ~ groupId:", groupId)

         await groupRepo.startPlan(groupId, "tier1")

         console.log("🚀 ~ handleStripeEvent ~ groupId:", groupId)
         console.log("✅ Successfully processed event:", event)
         break
      }

      default: {
         console.log("IGNORE event:", event.type)
         break
      }
   }
   return
}

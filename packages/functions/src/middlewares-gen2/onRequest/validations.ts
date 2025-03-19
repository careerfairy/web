import crypto from "crypto"
import { logger } from "firebase-functions/v2"
import { Middleware } from "./middleware"

export const KEEP_WARM_HEADER = "x-keepwarm"

/**
 * Middleware that handles warming requests
 * If the request contains the x-keepwarm=true header, it will respond and stop both the middleware chain and rest of the function execution
 * Otherwise, it will continue to the next middleware
 *
 * Required headers:
 * - x-keepwarm: "true" - Indicates this is a warming request
 */
export const warmingMiddleware: Middleware = async (
   request,
   response,
   next
) => {
   // Check if the warming header is present
   if (request.headers[KEEP_WARM_HEADER] === "true") {
      logger.info("Handling keep-warm request via middleware")
      response.status(200).send("Function is warm")
      // Don't call next, which stops the middleware chain
      return
   }

   // Not a warming request, continue to the next middleware
   return next(request, response)
}

export const validateDataExists: Middleware = (request, response, next) => {
   if (!request.body?.data) {
      response.status(401).json({
         error: "Unauthorized",
         message: "Missing data field",
      })
      return
   }
   return next(request, response)
}

/**
 * Middleware that validates Customer.io webhook signatures
 * If the request contains an invalid signature, it will respond with 401 and stop the middleware chain
 * Otherwise, it will continue to the next middleware
 *
 * Required headers:
 * - x-cio-signature: The signature from Customer.io
 * - x-cio-timestamp: The timestamp from Customer.io
 */
export const customerIOWebhookSignatureMiddleware = (
   signingKey: string
): Middleware => {
   return async (request, response, next) => {
      // Check if we have required headers and signing key
      const signature = request.headers["x-cio-signature"] as string
      const timestamp = request.headers["x-cio-timestamp"] as string

      if (!signature) {
         logger.error("CustomerIO: Missing x-cio-signature header")
         response.status(401).send("Unauthorized")
         return
      }

      if (!timestamp) {
         logger.error("CustomerIO: Missing x-cio-timestamp header")
         response.status(401).send("Unauthorized")
         return
      }

      if (!signingKey) {
         logger.error("CustomerIO: Missing signing key")
         response.status(401).send("Unauthorized")
         return
      }

      // Verify the webhook signature using the signing key
      const payload = request.rawBody
      const stringToSign = `v0:${timestamp}:${payload}`

      const hmac = crypto.createHmac("sha256", signingKey)
      const calculatedSignature = hmac.update(stringToSign).digest("hex")

      if (calculatedSignature !== signature) {
         logger.error("CustomerIO: Signature verification failed")
         response.status(401).send("Unauthorized")
         return
      }

      // Signature is valid, continue to next middleware
      return next(request, response)
   }
}

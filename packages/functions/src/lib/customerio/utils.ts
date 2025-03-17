import * as crypto from "crypto"
import { logger } from "firebase-functions/v2"
import { Request } from "firebase-functions/v2/https"

/**
 * Validates a Customer.io webhook signature
 *
 * @param request The HTTP request object
 * @param signingKey The signing key for validating the webhook signature
 * @returns True if signature is valid, false otherwise
 */
export function validateCustomerIOWebhookSignature(
   request: Request,
   signingKey: string
): boolean {
   // Check if we have required headers and signing key
   const signature = request.headers["x-cio-signature"] as string
   const timestamp = request.headers["x-cio-timestamp"] as string

   if (!signature) {
      logger.error("CustomerIO: Missing x-cio-signature header")
      return false
   }

   if (!timestamp) {
      logger.error("CustomerIO: Missing x-cio-timestamp header")
      return false
   }

   if (!signingKey) {
      logger.error("CustomerIO: Missing signing key")
      return false
   }

   // Verify the webhook signature using the signing key
   const payload = request.rawBody
   const stringToSign = `v0:${timestamp}:${payload}`

   const hmac = crypto.createHmac("sha256", signingKey)
   const calculatedSignature = hmac.update(stringToSign).digest("hex")

   if (calculatedSignature !== signature) {
      logger.error("CustomerIO: Signature verification failed")
      return false
   }

   return true
}

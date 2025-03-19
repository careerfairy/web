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

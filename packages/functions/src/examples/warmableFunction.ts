import { onRequest } from "firebase-functions/v2/https"
import { withMiddlewares } from "../middlewares-gen2/onRequest"
import { warmingMiddleware } from "../middlewares-gen2/validations-onRequest"
/**
 * Example HTTP function that uses the warming utility
 *
 * This shows how to integrate the keep-warm mechanism into your functions
 */
export const exampleHttpFunction = onRequest(
   withMiddlewares([warmingMiddleware], async (_, response) => {
      response.send("Hello, world!")
   })
)

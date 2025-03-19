import { onRequest } from "firebase-functions/v2/https"
import { handleWarmingRequest } from "../lib/warming"

/**
 * Example HTTP function that uses the warming utility
 *
 * This shows how to integrate the keep-warm mechanism into your functions
 */
export const exampleHttpFunction = onRequest(async (req, res) => {
   // Request was handled as a warming request, exit early
   if (handleWarmingRequest(req, res)) return

   // Continue with normal function execution
   try {
      // Your function logic here

      // Return response
      res.status(200).json({ success: true, data: "Your response data" })
   } catch (error) {
      console.error("Error in function execution:", error)
      res.status(500).json({
         success: false,
         error: "Internal server error",
      })
   }
})

import { https } from "firebase-functions"

export type MiddlewareContext = https.CallableContext & {
   /**
    * Allow middlewares to store data for the next middleware to access
    */
   middlewares?: Record<string, any>
}

export type OnCallMiddleware = (
   data: any,
   context: MiddlewareContext,
   /**
    * Calls the next middleware in the chain
    */
   next: () => Promise<any>
) => Promise<any>

/**
 * Chain multiple middleware functions with next functionality
 * @param middlewares
 */
export const middlewares = (...middlewares: OnCallMiddleware[]) => {
   return (data, context) => {
      let idx = 0

      const next = async () => {
         if (idx >= middlewares.length - 1) {
            // the last middleware called next
            throw new Error("No next middleware to call, you're the last one")
         }

         return middlewares[++idx](data, context, next)
      }

      // always call the first middleware
      // he can call or not next()
      return middlewares[idx](data, context, next)
   }
}

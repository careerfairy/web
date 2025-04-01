import { CallableRequest } from "firebase-functions/https"

export type MiddlewareContext<T extends Record<string, unknown>> =
   CallableRequest<T> & {
      /**
       * Allow middlewares to store data for the next middleware to access
       */
      middlewares?: T
   }

export type OnCallMiddleware<
   T extends Record<string, unknown> = Record<string, unknown>
> = (
   context: MiddlewareContext<T>,
   /**
    * Calls the next middleware in the chain
    */
   next: () => Promise<any>
) => Promise<any>

/**
 * Chain multiple middleware functions with next functionality
 * @param middlewares
 */
export const middlewares = <
   T extends Record<string, unknown> = Record<string, unknown>
>(
   ...middlewares: OnCallMiddleware<T>[]
) => {
   return (context: MiddlewareContext<T>) => {
      let idx = 0

      const next = async () => {
         if (idx >= middlewares.length - 1) {
            // the last middleware called next
            throw new Error("No next middleware to call, you're the last one")
         }

         return middlewares[++idx](context, next)
      }

      // always call the first middleware
      // he can call or not next()
      return middlewares[idx](context, next)
   }
}

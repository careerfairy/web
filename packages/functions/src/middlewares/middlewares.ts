import { https } from "firebase-functions"

export type CallableContext = https.CallableContext

export type MiddlewareContext<T extends Record<string, unknown>> =
   CallableContext & {
      /**
       * Allow middlewares to store data for the next middleware to access
       */
      middlewares?: T
   }

export type OnCallMiddleware<
   T extends Record<string, unknown> = Record<string, unknown>,
   TData = any
> = (
   data: TData,
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
   T extends Record<string, unknown> = Record<string, unknown>,
   TData = any
>(
   ...middlewares: OnCallMiddleware<T, TData>[]
) => {
   return (data: TData, context: MiddlewareContext<T>) => {
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

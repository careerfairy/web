import { CallableRequest } from "firebase-functions/v2/https"

export type Handler<T = unknown, Return = unknown> = (
   request: CallableRequest<T>
) => Promise<Return>

export type Middleware<T = unknown, Return = unknown> = (
   request: CallableRequest<T>,
   next: (request: CallableRequest<T>) => Promise<Return>
) => Promise<Return>

/**
 * Middleware function type for handling callable function requests
 *
 * @example
 * ```typescript
 * // Example authentication middleware
 * const authMiddleware: Middleware = async (request, next) => {
 *   if (!request.auth) {
 *     throw new Error('Unauthorized')
 *   }
 *   return next(request)
 * }
 *
 * // Example logging middleware
 * const loggingMiddleware: Middleware = async (request, next) => {
 *   console.log('Request received:', request.data)
 *   const result = await next(request)
 *   console.log('Response sent:', result)
 *   return result
 * }
 *
 * // Using middlewares with a handler
 * export const myFunction = onCall(
 *   withMiddlewares(
 *     [authMiddleware, loggingMiddleware],
 *     async (request) => {
 *       return { message: "Success!" }
 *     }
 *   )
 * )
 * ```
 */
export const withMiddlewares =
   <T = unknown, Return = unknown>(
      middlewares: Middleware<T, Return>[],
      handler: Handler<T, Return>
   ) =>
   (request: CallableRequest<T>): Promise<Return> => {
      const chainMiddlewares = ([
         firstMiddleware,
         ...restOfMiddlewares
      ]: Middleware<T, Return>[]): Handler<T, Return> => {
         if (firstMiddleware)
            return (request: CallableRequest<T>): Promise<Return> =>
               firstMiddleware(request, chainMiddlewares(restOfMiddlewares))
         else return handler
      }

      return chainMiddlewares(middlewares)(request)
   }

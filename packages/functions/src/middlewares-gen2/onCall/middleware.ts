import { CallableRequest } from "firebase-functions/v2/https"

// Input type -> Output type
export type Handler<TInput = unknown, TReturn = unknown> = (
   request: CallableRequest<TInput>
) => Promise<TReturn>

// Allow middlewares to transform the request type from TInput to TOutput
export type Middleware<
   TInput = unknown,
   TOutput = TInput,
   TReturn = unknown
> = (
   request: CallableRequest<TInput>,
   next: (request: CallableRequest<TOutput>) => Promise<TReturn>
) => Promise<TReturn>

/**
 * Helper type to extract input type from middleware
 */
type ExtractMiddlewareInput<M> = M extends Middleware<infer I, any, any>
   ? I
   : never

/**
 * Helper type to extract output type from middleware
 */
type ExtractMiddlewareOutput<M> = M extends Middleware<any, infer O, any>
   ? O
   : never

/**
 * Infers the input/output types from a middleware chain recursively
 */
type InferMiddlewareChain<
   TMiddlewares extends any[],
   TReturn = unknown
> = TMiddlewares extends []
   ? [unknown, unknown] // Empty array case
   : TMiddlewares extends [infer M]
   ? [ExtractMiddlewareInput<M>, ExtractMiddlewareOutput<M>] // Single middleware case
   : TMiddlewares extends [infer First, ...infer Rest]
   ? [
        ExtractMiddlewareInput<First>,
        InferMiddlewareChain<Rest, TReturn> extends [any, infer O] ? O : unknown
     ]
   : [unknown, unknown] // Fallback

/**
 * Middleware function type for handling callable function requests
 *
 * This implementation supports type transformations, where each middleware
 * can augment the request type, and this type information is properly passed
 * to the next middleware in the chain.
 *
 * @example
 * ```typescript
 * // Example authentication middleware that adds user data
 * const authMiddleware = <TInput>(): Middleware<TInput, TInput & { userData: UserData }> =>
 *   async (request, next) => {
 *     if (!request.auth) {
 *       throw new HttpsError("unauthenticated")
 *     }
 *     // Fetch user data and add to request
 *     const userData = await getUserData(request.auth.uid);
 *     const nextRequest = {
 *       ...request,
 *       data: { ...request.data, userData }
 *     };
 *     return next(nextRequest)
 *   }
 *
 * // Using middlewares with a handler - types are automatically inferred
 * export const mySecureFunction = onCall(
 *   withMiddlewares(
 *     [authMiddleware()],
 *     async (request) => {
 *       // request.data.userData is type-safe without explicit type params
 *       return { message: `Hello ${request.data.userData.name}!` }
 *     }
 *   )
 * )
 * ```
 */
export function withMiddlewares<
   TMiddlewareArray extends Middleware<any, any, any>[],
   TReturn = unknown
>(
   middlewares: [...TMiddlewareArray],
   handler: Handler<InferMiddlewareChain<TMiddlewareArray>[1], TReturn>
): Handler<InferMiddlewareChain<TMiddlewareArray>[0], TReturn> {
   return (initialRequest): Promise<TReturn> => {
      // Function to chain middlewares from left to right
      const chainMiddleware = (
         middleware: Middleware<any, any, TReturn>,
         next: Handler<any, TReturn>
      ): Handler<any, TReturn> => {
         return (request) => middleware(request, next)
      }

      // Build a wrapped handler by folding middlewares from right to left
      const wrappedHandler = middlewares.reduceRight(
         (nextHandler, middleware) => chainMiddleware(middleware, nextHandler),
         handler as Handler<any, TReturn>
      )

      // Execute the chain
      return wrappedHandler(initialRequest)
   }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
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
 * Infers types from a middleware array
 * M1 transforms TInput to T1
 * M2 transforms T1 to T2
 * etc.
 */
type InferMiddlewareChainIO<
   TArray extends any[],
   TReturn = unknown
> = TArray extends [infer M1]
   ? [ExtractMiddlewareInput<M1>, ExtractMiddlewareOutput<M1>, TReturn]
   : TArray extends [infer M1, infer M2]
   ? [ExtractMiddlewareInput<M1>, ExtractMiddlewareOutput<M2>, TReturn]
   : TArray extends [infer M1, infer M2, infer M3]
   ? [ExtractMiddlewareInput<M1>, ExtractMiddlewareOutput<M3>, TReturn]
   : TArray extends [infer M1, infer M2, infer M3, infer M4]
   ? [ExtractMiddlewareInput<M1>, ExtractMiddlewareOutput<M4>, TReturn]
   : TArray extends [infer M1, infer M2, infer M3, infer M4, infer M5]
   ? [ExtractMiddlewareInput<M1>, ExtractMiddlewareOutput<M5>, TReturn]
   : [unknown, unknown, TReturn]

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

// Type-safe middleware composition with automatic type inference
export function withMiddlewares<
   TMiddlewareArray extends Middleware<any, any, any>[],
   TReturn = unknown
>(
   middlewares: [...TMiddlewareArray],
   handler: Handler<
      InferMiddlewareChainIO<TMiddlewareArray, TReturn>[1],
      TReturn
   >
): Handler<InferMiddlewareChainIO<TMiddlewareArray, TReturn>[0], TReturn> {
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

// Simpler version with generic array of middlewares (less type-safe but more flexible)
export function withMiddlewaresGeneric<
   TInput = unknown,
   TOutput = unknown,
   TReturn = unknown
>(
   middlewares: Middleware<any, any, TReturn>[],
   handler: Handler<TOutput, TReturn>
): Handler<TInput, TReturn> {
   return (request: CallableRequest<TInput>): Promise<TReturn> => {
      const chainMiddlewares = ([
         firstMiddleware,
         ...restOfMiddlewares
      ]: Middleware<any, any, TReturn>[]): Handler<any, TReturn> => {
         if (firstMiddleware)
            return (request: CallableRequest<any>): Promise<TReturn> =>
               firstMiddleware(request, chainMiddlewares(restOfMiddlewares))
         else return handler as Handler<any, TReturn>
      }

      return chainMiddlewares(middlewares)(request)
   }
}

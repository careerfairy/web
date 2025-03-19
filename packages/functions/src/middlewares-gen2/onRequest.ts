import { Response } from "express"
import { Request } from "firebase-functions/v2/https"

export type Handler = (
   request: Request,
   response: Response
) => Promise<void> | void

export type Middleware = (
   request: Request,
   response: Response,
   next: (request: Request, response: Response) => Promise<void> | void
) => Promise<void> | void

/**
 * Middleware function type for handling HTTP request function requests
 *
 * @example
 * ```typescript
 * // Example authentication middleware
 * const authMiddleware: Middleware = async (request, response, next) => {
 *   const token = request.headers.authorization?.split("Bearer ")[1]
 *   if (!token) {
 *     response.status(401).json({ error: 'Unauthorized' })
 *     return
 *   }
 *   return next(request, response)
 * }
 *
 *
 * // Using middlewares with a handler
 * export const myFunction = onRequest(
 *   withMiddlewares(
 *     [authMiddleware],
 *     async (request, response) => {
 *       response.status(200).json({ message: "Success!" })
 *     }
 *   )
 * )
 * ```
 */
export const withMiddlewares =
   (middlewares: Middleware[], handler: Handler) =>
   (request: Request, response: Response): Promise<void> | void => {
      const chainMiddlewares = ([
         firstMiddleware,
         ...restOfMiddlewares
      ]: Middleware[]): Handler => {
         if (firstMiddleware)
            return (
               request: Request,
               response: Response
            ): Promise<void> | void =>
               firstMiddleware(
                  request,
                  response,
                  chainMiddlewares(restOfMiddlewares)
               )
         else return handler
      }

      return chainMiddlewares(middlewares)(request, response)
   }

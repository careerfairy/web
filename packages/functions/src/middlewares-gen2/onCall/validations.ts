import { Group } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import { logger } from "firebase-functions/v2"
import { HttpsError } from "firebase-functions/v2/https"
import {
   validateUserIsCFAdmin,
   validateUserIsGroupAdmin as validateUserIsGroupAdminFn,
} from "../../lib/validations"
import { Middleware } from "./middleware"

type WithGroupAdminData = {
   group: Group
   userData: UserData
}

/**
 * Middleware to validate if the user is a group admin or CF admin
 *
 * Throws an exception if user is not allowed
 *
 * Assumes request.data.groupId exists
 *
 * This middleware preserves the original input type while adding WithGroupAdminData
 */
export function userIsGroupAdminMiddleware<
   TInput extends { groupId: string }
>(): Middleware<TInput, TInput & WithGroupAdminData> {
   return async (request, next) => {
      // Check if user is authenticated
      if (!request.auth) {
         logger.error("User is not authenticated")
         throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      const { group, userData } = await validateUserIsGroupAdminFn(
         request.data.groupId,
         request.auth.token.email
      )

      return next({
         ...request,
         data: {
            ...request.data,
            group,
            userData,
         },
      })
   }
}

type WithCFAdminData = {
   userData: UserData
}

export function userIsCFAdminMiddleware<
   TInput = Record<string, any>
>(): Middleware<TInput, TInput & WithCFAdminData> {
   return async (request, next) => {
      // Check if user is authenticated
      if (!request.auth) {
         logger.error("User is not authenticated")
         throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      const userData = await validateUserIsCFAdmin(request.auth.token.email)

      return next({
         ...request,
         data: {
            ...request.data,
            userData,
         },
      })
   }
}

export function userAuthExistsMiddleware<
   TInput = Record<string, any>
>(): Middleware<TInput, TInput> {
   return async (request, next) => {
      // Check if user is authenticated
      // Could be separated into single function and reused in other middlewares
      if (!request.auth) {
         logger.error("User is not authenticated")
         throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      return next({
         ...request,
         data: request.data,
      })
   }
}

export const KEEP_WARM_ONCALL_KEY = "x-keepwarm-oncall"

/**
 * Middleware that handles warming requests for onCall functions.
 *
 * If the request contains the `x-keepwarm-oncall=true` field in `data`, it will short-circuit and return a warm response.
 * Otherwise, it will continue to the next middleware.
 *
 * Why access `data` instead of `headers`?
 * - onCall functions are designed for client SDKs (like Firebase JS, iOS, Android).
 * - The client sends a payload as the `data` argument, not as a raw HTTP request.
 * - The function receives a `request` object with:
 *   - `request.data` — the payload sent by the client
 *   - `request.auth` — authentication info (if available)
 *   - **No direct access to HTTP headers** (unlike onRequest functions)
 *
 * Summary: For onCall functions, always use `request.data` for metadata/flags. For onRequest (HTTP) functions, use `request.headers`.
 *
 * Usage: Place as the first middleware in the chain for onCall functions.
 */
export function warmingMiddleware<TInput = Record<string, any>>(): Middleware<
   TInput,
   TInput
> {
   return async (request, next) => {
      if ((request.data as any)?.[KEEP_WARM_ONCALL_KEY] === true) {
         logger.info("Handling keep-warm request via onCall middleware")
         // Short-circuit: return a simple warm response
         return { warm: true }
      }
      return next({ ...request, data: request.data })
   }
}

/**
 * Middleware to validate data against a schema in a type-safe manner
 * @param objectSchema - The schema to validate against
 * @throws HttpsError if the data is not valid
 */
export function dataValidationMiddleware<
   TSchema,
   TInput = unknown
>(objectSchema: {
   validate: (value: any, options?: any) => Promise<TSchema>
}): Middleware<TInput, TInput & TSchema> {
   return async (request, next) => {
      try {
         // Validate the data against the schema
         await objectSchema.validate(request.data, { abortEarly: false })

         // The data has been validated against the schema, so it's safe to pass it through
         return next({
            ...request,
            data: request.data as unknown as TInput & TSchema,
         })
      } catch (error) {
         logger.error("Data validation error", error)
         throw new HttpsError(
            "invalid-argument",
            error instanceof Error ? error.message : "Invalid data format"
         )
      }
   }
}

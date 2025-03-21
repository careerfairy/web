import { Group } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import { CallableRequest, HttpsError } from "firebase-functions/v2/https"
import { validateUserIsGroupAdmin as validateUserIsGroupAdminFn } from "../../lib/validations"
import { Middleware } from "./middleware"

// Define the shape of data added by the middleware
export interface WithGroupAdminData {
   middlewareData: {
      groupAdmin: {
         group: Group
         userData?: UserData
      }
   }
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
   return async (request: CallableRequest<TInput>, next) => {
      // Check if user is authenticated
      if (!request.auth) {
         throw new HttpsError("unauthenticated", "User must be authenticated")
      }

      const { group, userData } = await validateUserIsGroupAdminFn(
         request.data.groupId,
         request.auth.token.email
      )

      // Create a new request with strongly typed middleware data
      // while preserving all original fields from TInput
      const nextRequest: CallableRequest<TInput & WithGroupAdminData> = {
         ...request,
         data: {
            ...request.data, // Preserve ALL original fields from TInput
            middlewareData: {
               ...(request.data as any).middlewareData,
               groupAdmin: { group, userData },
            },
         },
      }

      return next(nextRequest)
   }
}

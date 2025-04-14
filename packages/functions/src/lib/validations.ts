import functions = require("firebase-functions")
import { GROUP_DASHBOARD_ROLE, Group } from "@careerfairy/shared-lib/groups"
import {
   LivestreamCTA,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { CallableContext } from "firebase-functions/lib/common/providers/https"
import { InferType } from "yup"
import ObjectSchema, { ObjectShape } from "yup/lib/object"
import { groupRepo, livestreamsRepo, userRepo } from "../api/repositories"
import { livestreamGetSecureToken } from "./livestream"

/**
 * Validate the data object argument in a function call
 *
 * @param data
 * @param schema yup schema
 */
export async function validateData<T extends ObjectShape>(
   data: any,
   schema: ObjectSchema<T>
): Promise<InferType<typeof schema>> {
   try {
      await schema.validate(data)
      return schema.cast(data)
   } catch (e) {
      logAndThrow(
         "Invalid Arguments Provided (schema validation failed)",
         data,
         e
      )
   }
}

/**
 * Validate the user is authenticated when calling a function
 * @param context
 */
export function validateUserAuthExists(context: CallableContext) {
   if (!context.auth) {
      logAndThrow("The user calling the function is not authenticated")
   }

   return Promise.resolve(context.auth.token)
}

/**
 * Validate the user is a group admin when calling a function
 *
 * If the user is group admin, the group object will be returned
 *
 * If the user is CF Admin, the userData will be returned
 *
 * @param groupId
 * @param email
 */
export async function validateUserIsGroupAdmin(
   groupId: string,
   email: string
): Promise<{
   isAdmin: boolean
   group: Group
   role: GROUP_DASHBOARD_ROLE
   isCFAdmin?: boolean
   userData?: UserData
}> {
   const response = await groupRepo.checkIfUserIsGroupAdmin(groupId, email)

   if (!response.isAdmin) {
      try {
         // check if user is CF admin, will throw if not
         const userData = await validateUserIsCFAdmin(email)

         return {
            ...response,
            userData,
            isCFAdmin: true,
         }
      } catch (e) {
         logAndThrow("The user is not a group admin", groupId, email)
      }
   }

   return response
}

export async function validateUserIsGroupAdminOwnerRole(
   userEmail: string,
   groupId: string
) {
   const response = await validateUserIsGroupAdmin(groupId, userEmail)

   if (response.role !== GROUP_DASHBOARD_ROLE.OWNER && !response.isCFAdmin) {
      logAndThrow(
         "The user is not an owner of the group",
         userEmail,
         groupId,
         response.role
      )
   }

   return response
}

/**
 * Validates if the user a CF Admin
 *
 * @param email
 */
export async function validateUserIsCFAdmin(email: string) {
   const userData = await userRepo.getUserDataById(email)

   if (!userData.isAdmin) {
      logAndThrow("The user is not a cf admin", email)
   }

   return userData
}
export function validateUserAuthNotExistent(context: CallableContext) {
   if (context.auth) {
      logAndThrow("The user calling the function is authenticated")
   }
}

export function logAndThrow(message: string, ...context: any[]): never {
   // Prepare the additional context for logging
   const additionalContext = context?.map((item) => {
      if (item instanceof Error) {
         // Convert Error to a plain object including message and stack
         return {
            errorMessage: item.message,
            errorStack: item.stack,
         }
      }
      return item
   })

   // Ensure the last argument is a plain object for the jsonPayload, functions logger will not log the error object, it will just show an empty object
   const logObject = { additionalContext }

   functions.logger.error(message, logObject)
   throw new functions.https.HttpsError("failed-precondition", message)
}

/**
 * Common Logic to validate Big Query Requests
 *
 * Checks if the user is authenticated and is a CF Admin
 * @param context
 */
export async function userIsSignedInAndIsCFAdmin(
   context: CallableContext
): Promise<void> {
   // validations that throw exceptions
   const idToken = await validateUserAuthExists(context)
   await validateUserIsCFAdmin(idToken.email)
   return
}

export async function validateLivestreamExists(
   livestreamId: string
): Promise<LivestreamEvent> {
   const livestream = await livestreamsRepo.getById(livestreamId)

   if (!livestream) {
      logAndThrow("Livestream does not exist", livestreamId)
   }
   return livestream
}

/**
 * Validates the provided livestream token against the stored token.
 * Throws an error if the livestream is not a test and the token is missing or does not match.
 *
 * @param livestream - The livestream event to validate the token for.
 * @param tokenToValidate - The token to validate against the livestream's stored token.
 */
export async function validateLivestreamToken(
   userEmail: string,
   livestream: LivestreamEvent,
   tokenToValidate?: string
): Promise<void> {
   if (userEmail) {
      const userData = await userRepo.getUserDataById(userEmail)

      const isAdmin = Boolean(userData.isAdmin)

      if (isAdmin) return
   }

   if (livestream.test) return

   if (!tokenToValidate) {
      logAndThrow("No host token provided", {
         livestreamId: livestream.id,
      })
   }

   const correctToken = await livestreamGetSecureToken(livestream.id)

   if (!correctToken.value) {
      logAndThrow(
         "The livestream is not a test stream and is missing a token",
         {
            livestreamId: livestream.id,
            tokenToValidate,
         }
      )
   }

   if (correctToken && correctToken.value !== tokenToValidate) {
      logAndThrow("The token does not match the livestream's token", {
         livestreamId: livestream.id,
         correctToken: correctToken.value,
         tokenToValidate,
      })
   }

   return
}

export async function validateCTAExists(
   livestreamId: string,
   ctaId: string
): Promise<LivestreamCTA> {
   const livestreamCTA = await livestreamsRepo.getCTA(livestreamId, ctaId)

   if (!livestreamCTA) {
      logAndThrow("CTA does not exist", livestreamId, ctaId)
   }
   return livestreamCTA
}

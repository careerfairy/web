import functions = require("firebase-functions")
import { groupRepo, livestreamsRepo, userRepo } from "../api/repositories"
import { CallableContext } from "firebase-functions/lib/common/providers/https"
import { Group, GROUP_DASHBOARD_ROLE } from "@careerfairy/shared-lib/groups"
import { UserData } from "@careerfairy/shared-lib/users"
import ObjectSchema, { ObjectShape } from "yup/lib/object"
import { InferType } from "yup"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

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
export function validateUserAuthExists(
   context: functions.https.CallableContext
) {
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
export function validateUserAuthNotExistent(
   context: functions.https.CallableContext
) {
   if (context.auth) {
      logAndThrow("The user calling the function is authenticated")
   }
}

export function logAndThrow(message: string, ...context: any[]): never {
   functions.logger.error(message, { ...context })
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

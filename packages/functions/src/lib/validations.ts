import functions = require("firebase-functions")
import BaseSchema from "yup/lib/schema"
import { groupRepo, userRepo } from "../api/repositories"

/**
 * Validate the data object argument in a function call
 *
 * @param data
 * @param schema yup schema
 */
export async function validateData(data: any, schema: BaseSchema) {
   try {
      return await schema.validate(data)
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
 * @param groupId
 * @param email
 */
export async function validateUserIsGroupAdmin(groupId: string, email: string) {
   const response = await groupRepo.checkIfUserIsGroupAdmin(groupId, email)

   if (!response.isAdmin) {
      try {
         // check if user is CF admin, will throw if not
         await validateUserIsCFAdmin(email)

         return response
      } catch (e) {
         logAndThrow("The user is not a group admin", groupId, email)
      }
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

export function logAndThrow(message: string, ...context: any[]) {
   functions.logger.error(message, { ...context })
   throw new functions.https.HttpsError("failed-precondition", message)
}

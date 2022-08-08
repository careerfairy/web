import functions = require("firebase-functions")
import BaseSchema from "yup/lib/schema"

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

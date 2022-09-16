import {
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin as validateUserIsGroupAdminFn,
} from "../lib/validations"
import { OnCallMiddleware } from "./middlewares"
import { ObjectShape } from "yup/lib/object"
import { object } from "yup"

/**
 * Validate if the user is authed, is group admin or is cf admin
 *
 * Throws an exception if is not allowed
 *
 * Assumes data.groupId exists
 */
export const userShouldBeGroupAdmin = (): OnCallMiddleware => {
   return async (data, context, next) => {
      const idToken = await validateUserAuthExists(context)

      const { group, userData } = await validateUserIsGroupAdminFn(
         data.groupId,
         idToken.email
      )

      // next middlewares may want to access this data
      context.middlewares = {
         ...context.middlewares,
         group,
         userData,
      }

      return next()
   }
}

/**
 * Validate a schema against the data property
 * @param objectSchemaShape
 */
export const dataValidation = (
   objectSchemaShape: ObjectShape
): OnCallMiddleware => {
   return async (data, context, next) => {
      // throws if not valid
      await validateData(data, object(objectSchemaShape))

      return next()
   }
}

import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { object } from "yup"
import ObjectSchema, { ObjectShape } from "yup/lib/object"
import {
   validateData,
   validateLivestreamExists,
   validateUserAuthExists,
   validateUserIsCFAdmin,
   validateUserIsGroupAdmin as validateUserIsGroupAdminFn,
} from "../lib/validations"
import { OnCallMiddleware } from "./middlewares"

/**
 * Validate if the user is authed, is group admin or is cf admin
 *
 * Throws an exception if is not allowed
 *
 * Assumes data.groupId exists
 */
export const userShouldBeGroupAdmin = (): OnCallMiddleware<{
   group?: Group
   userData?: UserData
   groupId: string
}> => {
   return async (context, next) => {
      const idToken = await validateUserAuthExists(context)

      const { group, userData } = await validateUserIsGroupAdminFn(
         context.data.groupId,
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
 * Validate if the user is a CF Admin
 *
 * Throws an exception if is not allowed
 */
export const userShouldBeCFAdmin = (): OnCallMiddleware => {
   return async (context, next) => {
      const idToken = await validateUserAuthExists(context)

      // throws if user is not a CF Admin
      await validateUserIsCFAdmin(idToken.email)

      return next()
   }
}

/**
 * Validate the user auth exists
 */
export const userAuthExists = (): OnCallMiddleware => {
   return async (context, next) => {
      // throws if auth isn't present
      await validateUserAuthExists(context)

      return next()
   }
}

/**
 * Validate data against a schema in a type-safe manner
 * @param objectSchema - The schema to validate against
 * @throws If the data is not valid
 */
export const dataValidation = <T extends ObjectShape>(
   objectSchema: ObjectShape | ObjectSchema<T>
): OnCallMiddleware => {
   return async (context, next) => {
      // throws if not valid
      if (objectSchema instanceof ObjectSchema) {
         await validateData(context.data, objectSchema)
      } else {
         await validateData(context.data, object(objectSchema))
      }

      return next()
   }
}

export const livestreamExists = (): OnCallMiddleware<{
   livestream: LivestreamEvent
   livestreamId: string
}> => {
   return async (context, next) => {
      const livestream = await validateLivestreamExists(
         context.data.livestreamId
      )

      context.middlewares = {
         ...context.middlewares,
         livestream,
      }

      return next()
   }
}

import { object, string } from "yup"
import {
   Group,
   GroupATSIntegrationTokensDocument,
} from "@careerfairy/shared-lib/dist/groups"
import { CallableContext } from "firebase-functions/lib/common/providers/https"
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin,
} from "./validations"
import { groupRepo } from "../api/repositories"
import { auth } from "firebase-admin"
import DecodedIdToken = auth.DecodedIdToken

type AlwaysPresentData = {
   groupId: string
   integrationId: string
}

type AlwaysPresentArgs = AlwaysPresentData & {
   idToken: DecodedIdToken
   group: Group
}

type Options<T extends object> = {
   data: T & AlwaysPresentData
   context: CallableContext
   requiredData?: object
}

/**
 * Common Logic to validate ATS Requests
 *
 * Returns the data fetched from the validations
 * @param options
 */
export async function atsRequestValidation<T extends object>(
   options: Options<T>
): Promise<T & AlwaysPresentArgs> {
   const inputSchema = object(
      Object.assign(
         {
            groupId: string().required(),
            integrationId: string().required(),
         },
         options.requiredData ?? {}
      )
   )

   // validations that throw exceptions
   const idToken = await validateUserAuthExists(options.context)
   const inputValidationResult = (await validateData(
      options.data,
      inputSchema
   )) as T & AlwaysPresentData

   const { group } = await validateUserIsGroupAdmin(
      inputValidationResult.groupId,
      idToken.email
   )

   return {
      ...inputValidationResult,
      idToken,
      group,
   }
}

/**
 * Extends the validation above and also fetches the account tokens
 * @param options
 */
export async function atsRequestValidationWithAccountToken<T extends object>(
   options: Options<T>
): Promise<
   T & AlwaysPresentArgs & { tokens: GroupATSIntegrationTokensDocument }
> {
   const data = await atsRequestValidation(options)

   // fetch account tokens (required to request information on behalf of the company)
   const accountTokens = await groupRepo.getATSIntegrationTokens(
      data.groupId,
      data.integrationId
   )
   if (!accountTokens) {
      logAndThrow("The requested integration is missing the account tokens", {
         groupId: data.groupId,
         integrationId: data.integrationId,
      })
   }

   return {
      ...data,
      tokens: accountTokens,
   }
}

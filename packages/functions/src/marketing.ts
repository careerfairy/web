import { MarketingUserCreationFields } from "@careerfairy/shared-lib/marketing/MarketingUser"
import { onCall } from "firebase-functions/https"
import { object, string } from "yup"
import { marketingUsersRepo, userRepo } from "./api/repositories"
import {
   logAndThrow,
   validateData,
   validateUserAuthNotExistent,
} from "./lib/validations"

/**
 * Creates a user in the marketingUsers collection
 * This function should be called on the custom landing pages
 */
export const createMarketingUser = onCall(async (request) => {
   // user shouldn't be signed in
   validateUserAuthNotExistent(request)

   // input data validation
   const inputData: MarketingUserCreationFields = await validateData(
      request.data,
      object({
         email: string().email().required(),
         firstName: string().required(),
         lastName: string().required(),
         fieldOfStudyId: string().required(),
         utmParams: object().optional(),
      })
   )

   // User email exists on userData, return error
   const existingUser = await userRepo.getUserDataById(inputData.email)

   if (existingUser) {
      return logAndThrow("That email belongs to a registered user")
   }

   // Create document if it doesn't exist already
   try {
      await marketingUsersRepo.create(inputData)
   } catch (e) {
      if (e.message?.indexOf("ALREADY_EXISTS") !== -1) {
         return logAndThrow("That email already exists")
      }

      throw e
   }

   // Schedule a marketing email to send later?

   return null
})

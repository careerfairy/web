import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthNotExistent,
} from "./lib/validations"
import { marketingUsersRepo, userRepo } from "./api/repositories"
import { object, string } from "yup"
import { MarketingUserCreationFields } from "@careerfairy/shared-lib/marketing/MarketingUser"
import config from "./config"

/**
 * Creates a user in the marketingUsers collection
 * This function should be called on the custom landing pages
 */
export const createMarketingUser = functions
   .region(config.region)
   .https.onCall(async (data, context) => {
      // user shouldn't be signed in
      validateUserAuthNotExistent(context)

      // input data validation
      const inputData: MarketingUserCreationFields = await validateData(
         data,
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

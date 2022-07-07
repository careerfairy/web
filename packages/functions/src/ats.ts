import functions = require("firebase-functions")
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin,
} from "./lib/validations"
import { object, string } from "yup"
import { groupRepo } from "./api/repositories"
import { GroupATSInformation } from "@careerfairy/shared-lib/dist/groups"
import { v4 as uuidv4 } from "uuid"
import { MergeATSRepository } from "@careerfairy/shared-lib/dist/ats/MergeATSRepository"
import { logAxiosError } from "./util"

/**
 * This function will be called when the group wants to integrate with an ATS system
 * We'll fetch a link_token from Merge that will be used to show the Merge Link dialog (ATS selector)
 */
export const mergeGenerateLinkToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const inputSchema = object({
         groupId: string().required(),
      })

      // validations that throw exceptions
      const { email } = await validateUserAuthExists(context)
      const { groupId } = await validateData(data, inputSchema)
      const { group } = await validateUserIsGroupAdmin(groupId, email)

      let atsMetadata: GroupATSInformation = await groupRepo.getATSMetadata(
         groupId
      )

      // No ATS metadata yet, lets create it
      if (!atsMetadata) {
         atsMetadata = {
            groupId: groupId,
            merge: {
               // not the group id to allow in the future a group to have multiple ats systems integrations
               // also we don't leak the group id
               end_user_origin_id: uuidv4(),
            },
            updatedAt: null, // will be filled by the repo bellow
         }

         await groupRepo.upsertATSMetadata(groupId, atsMetadata)
      }

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         // Temporary token initializing the user’s integration authorization session
         // We'll be able to open the Merge Link dialog to choose the integration
         return mergeATS.createLinkToken(
            atsMetadata.merge.end_user_origin_id,
            group.universityName,
            group.adminEmail
         )
      } catch (e) {
         logAxiosError("Failed to create a link token from merge", e)

         return null
      }

      // mudar o account token para um documento diferente
      // nao deixar criar nova integração se ja existir uma
      // pensar em deixar a empresar connectar varios sistemas?
   })

/**
 * This is the second step where we exchange a public token with the final group
 * account token (that should be used when querying the merge data for that group)
 */
export const mergeGetAccountToken = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const inputSchema = object({
         groupId: string().required(),
         publicToken: string().required(),
      })

      // validations that throw exceptions
      const { email } = await validateUserAuthExists(context)
      const { groupId, publicToken } = await validateData(data, inputSchema)
      await validateUserIsGroupAdmin(groupId, email)

      const atsMetadata: GroupATSInformation = await groupRepo.getATSMetadata(
         groupId
      )

      if (!atsMetadata?.merge?.end_user_origin_id) {
         return logAndThrow(
            "The first step merge integration was skipped",
            atsMetadata,
            publicToken
         )
      }

      if (!atsMetadata?.merge?.account_token) {
         return logAndThrow(
            "The group already has an account token",
            atsMetadata,
            publicToken
         )
      }

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         const mergeResponse = await mergeATS.exchangeAccountToken(publicToken)

         // Save the account token in the group ats doc
         await groupRepo.upsertATSMetadata(groupId, {
            merge: {
               account_token: mergeResponse.account_token,
            },
         })

         return true
      } catch (e) {
         logAxiosError(
            "Failed to exchange the public token with the account token",
            e
         )

         return null
      }
   })

import functions = require("firebase-functions")
import {
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
 *
 */
export const linkCompanyWithATS = functions
   .runWith({ secrets: ["MERGE_ACCESS_KEY"] })
   .https.onCall(async (data, context) => {
      const inputSchema = object({
         groupId: string().required(),
      })

      console.log("merge secret", process.env.MERGE_ACCESS_KEY)

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
         }

         await groupRepo.upsertATSMetadata(groupId, atsMetadata)
      }

      try {
         const mergeATS = new MergeATSRepository(process.env.MERGE_ACCESS_KEY)

         const mergeResponse = await mergeATS.createLinkToken(
            atsMetadata.merge.end_user_origin_id,
            group.universityName,
            group.adminEmail
         )

         // Temporary token initializing the user’s integration authorization session
         // We'll be able to open the Merge Link dialog to choose the integration
         return mergeResponse.link_token
      } catch (e) {
         logAxiosError("Failed to create a link token from merge", e)
      }

      // validate user is group admin
      // confirm group has or not a link token
      // if so, return it
      // create a link token from merge
      // save details in the group document
      // child document with creation date
   })

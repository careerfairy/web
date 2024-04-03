import functions = require("firebase-functions")
import {
   DeleteLivestreamChatEntryRequest,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { SchemaOf, boolean, object, string } from "yup"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, livestreamExists } from "./middlewares/validations"
import { livestreamsRepo, userRepo } from "./api/repositories"
import { livestreamGetSecureToken } from "./lib/livestream"

const deleteLivestreamChatEntrySchema: SchemaOf<DeleteLivestreamChatEntryRequest> =
   object()
      .shape({
         entryId: string().nullable(),
         deleteAll: boolean().nullable(),
         livestreamId: string().required(),
         livestreamToken: string().nullable(),
         agoraUserId: string().nullable(),
      })
      .test(
         "either-entryId-or-deleteAll",
         "Either entryId or deleteAll must be provided, but not both",
         (obj) => {
            const { entryId, deleteAll } = obj
            const isEntryIdProvided = Boolean(entryId)
            const isDeleteAllProvided = Boolean(deleteAll)
            // Return true if exactly one of them is provided
            return isEntryIdProvided !== isDeleteAllProvided
         }
      )

type DeleteContext = {
   livestream: LivestreamEvent
}

export const deleteLivestreamChatEntry = functions
   .region(config.region)
   .https.onCall(
      middlewares<DeleteContext, DeleteLivestreamChatEntryRequest>(
         dataValidation(deleteLivestreamChatEntrySchema),
         livestreamExists(),
         async (requestData, context) => {
            const {
               agoraUserId,
               livestreamId,
               livestreamToken,
               deleteAll,
               entryId,
            } = requestData

            const userEmail = context.auth?.token?.email || ""

            // Determine if the user is an admin
            const isAdmin = await checkIfUserIsAdmin(userEmail)

            // // Validate token if necessary

            // Perform deletion based on the request type
            if (deleteAll) {
               await validateTokenIfNeeded(
                  isAdmin,
                  userEmail,
                  livestreamToken,
                  context.middlewares.livestream
               )
               return await deleteAllEntries(livestreamId)
            } else {
               const isAuthor = await checkIfIsAuthor(
                  agoraUserId,
                  userEmail,
                  livestreamId,
                  entryId
               )

               if (!isAuthor) {
                  await validateTokenIfNeeded(
                     isAdmin,
                     userEmail,
                     livestreamToken,
                     context.middlewares.livestream
                  )
               }
               return await deleteSingleEntry(livestreamId, entryId)
            }
         }
      )
   )

/**
 * Validates a token for a livestream event asynchronously.
 * It verifies if the livestream is a test, if the user is an admin, or if the token matches the livestream's secure token.
 * It also addresses scenarios where no token is provided.
 *
 * @async
 * @function validateLivestreamToken
 */
const validateLivestreamToken = async (
   userId: string,
   livestream: LivestreamEvent,
   tokenToValidate: string | null
): Promise<void> => {
   if (livestream.test) return

   if (!tokenToValidate) {
      logAndThrow("No host token provided cannot perform action", {
         userId,
         livestreamId: livestream.id,
      })
   }

   const correctToken = await livestreamGetSecureToken(livestream.id)

   let errorMessage = ""

   if (!correctToken.value || !tokenToValidate) {
      errorMessage =
         "The livestream is not a test stream and is missing a valid token"
   }

   if (correctToken && correctToken.value !== tokenToValidate) {
      errorMessage = "The token does not match the livestream's token"
   }

   if (errorMessage) {
      logAndThrow(errorMessage, {
         livestreamId: livestream.id,
         correctToken: correctToken ? correctToken.value : null,
         tokenToValidate,
         userId,
      })
   }
}

const checkIfUserIsAdmin = async (userEmail: string): Promise<boolean> => {
   if (!userEmail) return false
   const userData = await userRepo.getUserDataById(userEmail)
   return Boolean(userData.isAdmin)
}

const validateTokenIfNeeded = async (
   isAdmin: boolean,
   userEmail: string,
   token: string | null,
   livestream: LivestreamEvent
) => {
   if (!isAdmin) {
      await validateLivestreamToken(userEmail, livestream, token)
   }
}

const deleteAllEntries = async (livestreamId: string) => {
   return livestreamsRepo.deleteAllLivestreamChatEntries(livestreamId)
}

const checkIfIsAuthor = async (
   agoraUserId: string,
   userEmail: string,
   livestreamId: string,
   entryId: string
) => {
   const entryToDelete = await livestreamsRepo.getLivestreamChatEntry(
      livestreamId,
      entryId
   )

   return (
      (entryToDelete.authorEmail && entryToDelete.authorEmail === userEmail) ||
      (entryToDelete.agoraUserId && entryToDelete.agoraUserId === agoraUserId)
   )
}

const deleteSingleEntry = async (livestreamId: string, entryId: string) => {
   return livestreamsRepo.deleteLivestreamChatEntry(livestreamId, entryId)
}

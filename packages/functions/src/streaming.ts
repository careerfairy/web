import functions = require("firebase-functions")
import {
   DeleteLivestreamChatEntryRequest,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { SchemaOf, boolean, object, string } from "yup"
import config from "./config"
import { logAndThrow, validateUserIsCFAdmin } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, livestreamExists } from "./middlewares/validations"
import { livestreamsRepo } from "./api/repositories"
import { livestreamGetSecureToken } from "./lib/livestream"

const deleteLivestreamChatEntrySchema: SchemaOf<DeleteLivestreamChatEntryRequest> =
   object().shape({
      entryId: string().when("deleteAll", {
         is: false,
         then: string().required(),
         otherwise: string().optional(),
      }),
      deleteAll: boolean().optional(),
      livestreamId: string().required(),
      livestreamToken: string().nullable(),
      agoraUserId: string().nullable(),
   })

type DeleteContext = {
   livestream: LivestreamEvent
}

export const deleteLivestreamChatEntry = functions
   .region(config.region)
   .https.onCall(
      middlewares<DeleteContext, DeleteLivestreamChatEntryRequest>(
         dataValidation(deleteLivestreamChatEntrySchema),
         livestreamExists(),
         async (data, context) => {
            const userEmail = context.auth?.token?.email

            if (data.deleteAll) {
               await validateLivestreamToken(
                  userEmail,
                  context.middlewares.livestream,
                  data.livestreamToken
               )
               return livestreamsRepo.deleteAllLivestreamChatEntries(
                  data.livestreamId
               )
            }
            if (data.entryId) {
               const entryToDelete =
                  await livestreamsRepo.getLivestreamChatEntry(
                     data.livestreamId,
                     data.entryId
                  )

               if (
                  entryToDelete.agoraUserId !== data.agoraUserId ||
                  entryToDelete.authorEmail !== userEmail
               ) {
                  // If you are not the author of the entry, You can delete it if you have a valid token
                  await validateLivestreamToken(
                     context.auth?.token?.email,
                     context.middlewares.livestream,
                     data.livestreamToken
                  )
               }

               return livestreamsRepo.deleteLivestreamChatEntry(
                  data.livestreamId,
                  data.entryId
               )
            }

            return livestreamsRepo.deleteLivestreamChatEntry(
               data.livestreamId,
               data.entryId
            )
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
      logAndThrow("No token provided", {
         userId,
         livestreamId: livestream.id,
      })
   }

   const correctToken = await livestreamGetSecureToken(livestream.id)

   if (
      !correctToken ||
      correctToken.value !== tokenToValidate ||
      !tokenToValidate
   ) {
      let errorMessage =
         "The livestream is not a test stream and is missing a valid token"
      if (!tokenToValidate) {
         errorMessage = "No token provided"
      } else if (correctToken && correctToken.value !== tokenToValidate) {
         errorMessage = "The token is incorrect"
      }

      try {
         await validateUserIsCFAdmin(userId)
      } catch (error) {
         logAndThrow(`${errorMessage} and user is not a CF admin`, {
            userId,
            livestreamId: livestream.id,
            correctToken: correctToken ? correctToken.value : null,
            tokenToValidate,
         })
      }

      logAndThrow(errorMessage, {
         livestreamId: livestream.id,
         correctToken: correctToken ? correctToken.value : null,
         tokenToValidate,
         userId,
      })
   }
}

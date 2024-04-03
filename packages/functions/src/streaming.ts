import functions = require("firebase-functions")
import {
   DeleteLivestreamChatEntryRequest,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { isDefinedAndEqual } from "@careerfairy/shared-lib/utils"
import { SchemaOf, boolean, object, string } from "yup"
import config from "./config"
import { validateLivestreamToken } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation, livestreamExists } from "./middlewares/validations"
import { livestreamsRepo, userRepo } from "./api/repositories"

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
            const userUid = context.auth?.token?.uid || ""

            const isAdmin = await checkIfUserIsAdmin(userEmail)

            if (deleteAll) {
               await validateTokenIfNeeded(
                  isAdmin,
                  livestreamToken,
                  context.middlewares.livestream
               )

               return await deleteAllEntries(livestreamId)
            } else {
               const isAuthor = await checkIfIsAuthor(
                  agoraUserId,
                  userEmail,
                  userUid,
                  livestreamId,
                  entryId
               )

               if (!isAuthor) {
                  await validateTokenIfNeeded(
                     isAdmin,
                     livestreamToken,
                     context.middlewares.livestream
                  )
               }

               return await deleteSingleEntry(livestreamId, entryId)
            }
         }
      )
   )

const checkIfUserIsAdmin = async (userEmail: string): Promise<boolean> => {
   if (!userEmail) return false
   const userData = await userRepo.getUserDataById(userEmail)
   return Boolean(userData.isAdmin)
}

const validateTokenIfNeeded = async (
   isAdmin: boolean,
   token: string | null,
   livestream: LivestreamEvent
) => {
   if (!isAdmin) {
      await validateLivestreamToken(livestream, token)
   }
}

const deleteAllEntries = async (livestreamId: string) => {
   return livestreamsRepo.deleteAllLivestreamChatEntries(livestreamId)
}

const checkIfIsAuthor = async (
   agoraUserId: string,
   userEmail: string,
   userUid: string,
   livestreamId: string,
   entryId: string
) => {
   const entryToDelete = await livestreamsRepo.getLivestreamChatEntry(
      livestreamId,
      entryId
   )

   return (
      isDefinedAndEqual(entryToDelete.authorEmail, userEmail) ||
      isDefinedAndEqual(entryToDelete.agoraUserId, agoraUserId) ||
      isDefinedAndEqual(entryToDelete.userUid, userUid)
   )
}

const deleteSingleEntry = async (livestreamId: string, entryId: string) => {
   return livestreamsRepo.deleteLivestreamChatEntry(livestreamId, entryId)
}

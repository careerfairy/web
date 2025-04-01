import {
   DeleteLivestreamChatEntryRequest,
   LivestreamChatEntry,
   LivestreamEvent,
} from "@careerfairy/shared-lib/livestreams"
import { isDefinedAndEqual } from "@careerfairy/shared-lib/utils"
import { onCall } from "firebase-functions/https"
import { SchemaOf, boolean, object, string } from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"

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

type DeleteLivestreamChatEntryContext = DeleteContext &
   DeleteLivestreamChatEntryRequest

export const deleteLivestreamChatEntry = onCall(
   middlewares<DeleteLivestreamChatEntryContext>(
      dataValidation(deleteLivestreamChatEntrySchema),
      livestreamExists(),
      async (request) => {
         const {
            agoraUserId,
            livestreamId,
            livestreamToken,
            deleteAll,
            entryId,
         } = request.data

         const userEmail = request.auth?.token?.email || ""
         const userUid = request.auth?.token?.uid || ""

         if (deleteAll) {
            await validateLivestreamToken(
               userEmail,
               request.middlewares.livestream,
               livestreamToken
            )

            return await deleteAllEntries(livestreamId)
         } else {
            const entryToDelete = await livestreamsRepo.getLivestreamChatEntry(
               livestreamId,
               entryId
            )

            if (!entryToDelete) return

            const isAuthor = await checkIfIsAuthor(
               agoraUserId,
               userEmail,
               userUid,
               entryToDelete
            )

            if (!isAuthor) {
               await validateLivestreamToken(
                  userEmail,
                  request.middlewares.livestream,
                  livestreamToken
               )
            }

            return await deleteSingleEntry(livestreamId, entryId)
         }
      }
   )
)

const deleteAllEntries = async (livestreamId: string) => {
   return livestreamsRepo.deleteAllLivestreamChatEntries(livestreamId)
}

const checkIfIsAuthor = async (
   agoraUserId: string,
   userEmail: string,
   userUid: string,
   entryToDelete: LivestreamChatEntry
) => {
   return (
      isDefinedAndEqual(entryToDelete.authorEmail, userEmail) ||
      isDefinedAndEqual(entryToDelete.agoraUserId, agoraUserId) ||
      isDefinedAndEqual(entryToDelete.userUid, userUid)
   )
}

const deleteSingleEntry = async (livestreamId: string, entryId: string) => {
   return livestreamsRepo.deleteLivestreamChatEntry(livestreamId, entryId)
}

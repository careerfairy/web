import functions = require("firebase-functions")
import { DeleteLivestreamRequest } from "@careerfairy/shared-lib/functions/types"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "../../middlewares/validations"
import { logAndThrow } from "../validations"

const deleteLivestreamSchema = yup.object({
   livestreamId: yup.string().required(),
   collection: yup
      .string()
      .oneOf(["livestreams", "draftLivestreams"])
      .required(),
   groupId: yup.string().required(),
})

type Context = {
   livestream: LivestreamEvent
   group?: Group
}

export const deleteLivestream = onCall(
   middlewares<Context & DeleteLivestreamRequest>(
      dataValidation(deleteLivestreamSchema),
      userShouldBeGroupAdmin(),
      async (request) => {
         const { livestreamId, collection } = request.data
         try {
            functions.logger.info("Deleting livestream", {
               livestreamId,
               collection,
               groupId: request.data.groupId,
            })

            // Use repository method to delete livestream and associated data
            await livestreamsRepo.deleteLivestream(livestreamId, collection)

            functions.logger.info("Livestream deleted successfully", {
               livestreamId,
               collection,
               groupId: request.data.groupId,
            })
         } catch (error) {
            logAndThrow(error, {
               title: "Error deleting livestream",
               details: {
                  livestreamId,
                  collection,
                  groupId: request.data.groupId,
               },
            })
         }
      }
   )
)

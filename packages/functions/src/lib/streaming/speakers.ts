import {
   CreatorRole,
   CreatorRoles,
} from "@careerfairy/shared-lib/groups/creators"
import { baseCreatorShape } from "@careerfairy/shared-lib/groups/schemas"
import {
   LivestreamEvent,
   UpsertSpeakerRequest,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { groupRepo, livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import { dataValidation, livestreamExists } from "../../middlewares/validations"
import { validateLivestreamToken } from "../validations"
import functions = require("firebase-functions")

type Context = {
   livestream: LivestreamEvent
}

// @ts-ignore: Suppress TypeScript error for roles field
const upsertSpeakerSchema: yup.SchemaOf<UpsertSpeakerRequest> = yup.object({
   livestreamId: yup.string().required(),
   livestreamToken: yup.string().nullable(),
   speaker: yup
      .object({
         id: baseCreatorShape.id,
         avatar: baseCreatorShape.avatarUrl.required(),
         background: baseCreatorShape.story,
         firstName: baseCreatorShape.firstName,
         lastName: baseCreatorShape.lastName,
         position: baseCreatorShape.position,
         linkedInUrl: baseCreatorShape.linkedInUrl,
         roles: yup
            .array()
            .of(yup.mixed<CreatorRole>().oneOf(Object.values(CreatorRoles))),
         rank: yup.number(),
      })
      .required(),
})

type Data = UpsertSpeakerRequest & Context

export const upsertLivestreamSpeaker = onCall(
   middlewares<Data>(
      dataValidation(upsertSpeakerSchema),
      livestreamExists(),
      async (request) => {
         const { livestreamId, livestreamToken, speaker } = request.data

         functions.logger.info("Upserting livestream speaker", {
            livestreamId,
            speaker,
         })

         await validateLivestreamToken(
            request.auth?.token?.email,
            request.middlewares?.livestream,
            livestreamToken
         )

         const isEditing = Boolean(speaker.id)
         if (isEditing) {
            functions.logger.info("Editing existing speaker", {
               speakerId: speaker.id,
            })

            // check if speaker is related to an existing Creator
            const existingCreator = await groupRepo.getCreatorById(speaker.id)

            if (existingCreator && existingCreator.groupId) {
               functions.logger.info("Existing creator found", {
                  existingCreator,
               })
               await groupRepo.updateCreatorInGroup(
                  existingCreator.groupId,
                  existingCreator.id,
                  {
                     avatarUrl: speaker.avatar,
                     firstName: speaker.firstName,
                     lastName: speaker.lastName,
                     id: speaker.id,
                     story: speaker.background,
                     linkedInUrl: speaker.linkedInUrl,
                     position: speaker.position,
                  }
               )
            }

            // Update the livestream speaker
            functions.logger.info("Updating livestream speaker", {
               livestreamId,
               speaker,
            })
            return livestreamsRepo.updateLivestreamSpeaker(
               livestreamId,
               speaker
            )
         } else {
            functions.logger.info("Adding new ad hoc speaker", {
               livestreamId,
               speaker,
            })
            // Only add Speaker as an adhoc speaker
            return livestreamsRepo.addAdHocSpeaker(livestreamId, speaker)
         }
      }
   )
)

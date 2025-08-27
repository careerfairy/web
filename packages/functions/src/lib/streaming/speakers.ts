import {
   CreatorRole,
   CreatorRoles,
} from "@careerfairy/shared-lib/groups/creators"
import { baseCreatorShape } from "@careerfairy/shared-lib/groups/schemas"
import {
   LivestreamEvent,
   UpsertSpeakerRequest,
} from "@careerfairy/shared-lib/livestreams"
import { HttpsError, onCall } from "firebase-functions/v2/https"
import * as yup from "yup"
import { groupRepo, livestreamsRepo } from "../../api/repositories"
import { withMiddlewares } from "../../middlewares-gen2/onCall/middleware"
import {
   dataValidationMiddleware,
   livestreamExistsMiddleware,
   userIsLivestreamAdminMiddleware,
} from "../../middlewares-gen2/onCall/validations"
import { validateLivestreamToken, validateUserIsCFAdmin } from "../validations"
import functions = require("firebase-functions")

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

export const upsertLivestreamSpeaker = onCall(
   withMiddlewares(
      [
         dataValidationMiddleware(upsertSpeakerSchema),
         livestreamExistsMiddleware(),
      ],
      async (request) => {
         const { livestreamId, livestreamToken, speaker, livestream } =
            request.data as UpsertSpeakerRequest & {
               livestream: LivestreamEvent
            }

         functions.logger.info("Upserting livestream speaker", {
            livestreamId,
            speaker,
         })

         await validateLivestreamToken(
            request.auth?.token?.email,
            livestream,
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
               functions.logger.info(
                  "Existing creator found - checking permissions",
                  {
                     existingCreator,
                  }
               )

               // Check if user has permission to edit group creators
               const lsGroupIds: string[] = livestream?.groupIds || []
               let hasPermission = false

               // Check if user is CF admin
               try {
                  await validateUserIsCFAdmin(request.auth?.token?.email)
                  hasPermission = true
               } catch (e) {
                  // User is not CF admin, check group admin status
               }

               // Check if user is admin of any of the livestream's host groups
               if (!hasPermission && lsGroupIds.length > 0) {
                  const adminGroups = request.auth?.token?.adminGroups || {}
                  const userAdminGroupIds = Object.keys(adminGroups)

                  hasPermission = userAdminGroupIds.some((groupId) =>
                     lsGroupIds.includes(groupId)
                  )
               }

               if (!hasPermission) {
                  throw new HttpsError(
                     "permission-denied",
                     "Not authorized to edit group speakers on this livestream"
                  )
               }

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
            // Anyone can add ad-hoc speakers - no permission check needed
            return livestreamsRepo.addAdHocSpeaker(livestreamId, speaker)
         }
      }
   )
)

type UpdateCreatorRolesInput = {
   livestreamId: string
   targetGroupId: string
   creatorId: string
   roles: CreatorRole[]
}

export const updateCreatorRoles = onCall<UpdateCreatorRolesInput>(
   withMiddlewares(
      [
         dataValidationMiddleware(
            yup
               .object({
                  livestreamId: yup.string().required(),
                  targetGroupId: yup.string().required(),
                  creatorId: yup.string().required(),
                  roles: yup
                     .array()
                     .of(
                        yup
                           .mixed<CreatorRole>()
                           .oneOf(Object.values(CreatorRoles))
                     )
                     .required(),
               })
               .required()
         ),
         livestreamExistsMiddleware(),
         userIsLivestreamAdminMiddleware(),
      ],
      async (request) => {
         const { targetGroupId, creatorId, roles, livestream } =
            request.data as UpdateCreatorRolesInput & {
               livestream: LivestreamEvent
               isCFAdmin: boolean
               isLivestreamHostAdmin: boolean
            }

         const lsGroupIds: string[] = livestream?.groupIds || []
         if (!lsGroupIds.includes(targetGroupId)) {
            throw new HttpsError(
               "permission-denied",
               "Target group is not a co-host of this livestream"
            )
         }

         await groupRepo.updateCreatorRolesInGroup(
            targetGroupId,
            creatorId,
            roles
         )

         return { ok: true }
      }
   )
)

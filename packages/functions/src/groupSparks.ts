import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import {
   AddSparkSparkData,
   DeleteSparkData,
   sparksCategoriesArray,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"
import { logger } from "firebase-functions/v2"
import { onCall } from "firebase-functions/v2/https"
import { boolean, number, object, string } from "yup"
import { groupRepo, sparkRepo } from "./api/repositories"
import { logAndThrow } from "./lib/validations"
import { withMiddlewares } from "./middlewares-gen2/onCall"
import {
   dataValidationMiddleware,
   userIsGroupAdminMiddleware,
} from "./middlewares-gen2/onCall/validations"
import { validateGroupSparks } from "./util/sparks"

const sparkDataSchema = object().shape({
   question: string()
      .required()
      .max(SPARK_CONSTANTS.QUESTION_MAX_LENGTH)
      .min(SPARK_CONSTANTS.QUESTION_MIN_LENGTH),
   categoryId: string()
      .oneOf(sparksCategoriesArray.map((category) => category.id))
      .required("Category is required"),
   languageId: string()
      .oneOf(languageOptionCodes.map((lang) => lang.id))
      .required("Language is required"),
   published: boolean().required(),
   creatorId: string().required(),
   groupId: string().required(),
})

const videoDataSchema = object().shape({
   video: object()
      .shape({
         uid: string().required(),
         fileExtension: string().required(),
         url: string().required(),
         thumbnailUrl: string().required(),
         duration: number().required(),
      })
      .required(),
})

type CreateSparkData = AddSparkSparkData & { group: Group }
type UpdateSparkDataWithGroup = UpdateSparkData & { group: Group }
type DeleteSparkDataWithGroup = DeleteSparkData & { group: Group }

export const createSpark = onCall(
   withMiddlewares(
      [
         dataValidationMiddleware(
            object().shape({
               ...sparkDataSchema.fields,
               ...videoDataSchema.fields,
            })
         ),
         userIsGroupAdminMiddleware(),
      ],
      async (request) => {
         try {
            const { group, ...sparkData } =
               request.data as unknown as CreateSparkData

            const creator = await groupRepo.getCreatorByGroupAndId(
               group.id,
               sparkData.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", sparkData)
            }

            await sparkRepo.create(sparkData, group, creator)

            logger.info(
               `Create Spark '${sparkData.question}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in creating spark", error, request.data)
         }
      }
   )
)

export const updateSpark = onCall(
   withMiddlewares(
      [
         dataValidationMiddleware(
            object().shape({
               ...sparkDataSchema.fields,
               id: string().required(),
            })
         ),
         userIsGroupAdminMiddleware(),
      ],
      async (request) => {
         try {
            const { group, ...sparkData } =
               request.data as unknown as UpdateSparkDataWithGroup

            const creator = await groupRepo.getCreatorByGroupAndId(
               group.id,
               sparkData.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", sparkData)
            }

            await sparkRepo.update(sparkData, creator)

            logger.info(
               `Update Spark '${sparkData.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in updating spark", error, request.data)
         }
      }
   )
)

export const deleteSpark = onCall(
   withMiddlewares(
      [
         dataValidationMiddleware(
            object().shape({
               id: string().required(),
               groupId: string().required(),
            })
         ),
         userIsGroupAdminMiddleware(),
      ],
      async (request) => {
         try {
            const { group, ...sparkData } =
               request.data as unknown as DeleteSparkDataWithGroup
            await sparkRepo.delete(sparkData.id)

            logger.info(
               `Delete Spark '${sparkData.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in deleting spark", error, request.data)
         }
      }
   )
)

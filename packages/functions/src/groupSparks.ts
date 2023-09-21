import functions = require("firebase-functions")
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import {
   AddSparkSparkData,
   DeleteSparkData,
   UpdateSparkData,
   sparksCategoriesArray,
} from "@careerfairy/shared-lib/sparks/sparks"
import { boolean, object, string } from "yup"
import { groupRepo, sparkRepo } from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { validateGroupSparks } from "./util/sparks"

const sparkDataValidator = {
   question: string()
      .required()
      .max(SPARK_CONSTANTS.QUESTION_MAX_LENGTH)
      .min(SPARK_CONSTANTS.QUESTION_MIN_LENGTH),
   categoryId: string()
      .oneOf(sparksCategoriesArray.map((category) => category.id))
      .required("Category is required"),
   published: boolean().required(),
   creatorId: string().required(),
   groupId: string().required(),
} as const

const videoDataValidator = {
   video: object()
      .shape({
         uid: string().required(),
         fileExtension: string().required(),
         url: string().required(),
         thumbnailUrl: string().required(),
      })
      .required(),
} as const

export const createSpark = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         ...sparkDataValidator,
         ...videoDataValidator,
      }),
      userShouldBeGroupAdmin(),
      async (data: AddSparkSparkData, context) => {
         try {
            const group = context.middlewares.group as Group

            const creator = await groupRepo.getCreatorById(
               group.id,
               data.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", {
                  data,
                  context,
               })
            }

            await sparkRepo.create(data, group, creator)

            functions.logger.log(
               `Create Spark '${data.question}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in creating spark", {
               data,
               error,
               context,
            })
         }
      }
   )
)

export const updateSpark = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         ...sparkDataValidator,
         id: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (data: UpdateSparkData, context) => {
         try {
            const group = context.middlewares.group as Group

            const creator = await groupRepo.getCreatorById(
               group.id,
               data.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", {
                  data,
                  context,
               })
            }

            await sparkRepo.update(data, creator)

            functions.logger.log(
               `Update Spark '${data.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in updating spark", {
               data,
               error,
               context,
            })
         }
      }
   )
)

export const deleteSpark = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         id: string().required(),
         groupId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (data: DeleteSparkData, context) => {
         try {
            const group = context.middlewares.group as Group
            await sparkRepo.delete(data.id)

            functions.logger.log(
               `Delete Spark '${data.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in deleting spark", {
               data,
               error,
               context,
            })
         }
      }
   )
)

import functions = require("firebase-functions")
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import {
   AddSparkSparkData,
   DeleteSparkData,
   sparksCategoriesArray,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"
import { onCall } from "firebase-functions/https"
import { boolean, number, object, string } from "yup"
import { groupRepo, sparkRepo } from "./api/repositories"
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
         duration: number().required(),
      })
      .required(),
} as const

export const createSpark = onCall(
   middlewares<AddSparkSparkData & { group: Group }>(
      dataValidation({
         ...sparkDataValidator,
         ...videoDataValidator,
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         try {
            const group = request.middlewares.group

            const creator = await groupRepo.getCreatorByGroupAndId(
               group.id,
               request.data.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", {
                  data: request.data,
                  context: request,
               })
            }

            await sparkRepo.create(request.data, group, creator)

            functions.logger.log(
               `Create Spark '${request.data.question}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in creating spark", {
               data: request.data,
               error,
               context: request,
            })
         }
      }
   )
)

export const updateSpark = onCall(
   middlewares<UpdateSparkData & { group: Group }>(
      dataValidation({
         ...sparkDataValidator,
         id: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         try {
            const group = request.middlewares.group as Group

            const creator = await groupRepo.getCreatorByGroupAndId(
               group.id,
               request.data.creatorId
            )

            if (!creator) {
               logAndThrow("Creator not found", {
                  data: request.data,
                  context: request,
               })
            }

            await sparkRepo.update(request.data, creator)

            functions.logger.log(
               `Update Spark '${request.data.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in updating spark", {
               data: request.data,
               error,
               context: request,
            })
         }
      }
   )
)

export const deleteSpark = onCall(
   middlewares<DeleteSparkData & { group: Group }>(
      dataValidation({
         id: string().required(),
         groupId: string().required(),
      }),
      userShouldBeGroupAdmin(),
      async (request) => {
         try {
            const group = request.middlewares.group as Group
            await sparkRepo.delete(request.data.id)

            functions.logger.log(
               `Delete Spark '${request.data.id}' completed, start validation`
            )
            return validateGroupSparks(group)
         } catch (error) {
            logAndThrow("Error in deleting spark", {
               data: request.data,
               error,
               context: request,
            })
         }
      }
   )
)

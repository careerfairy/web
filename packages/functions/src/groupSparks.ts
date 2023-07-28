import functions = require("firebase-functions")
import config from "./config"
import { MiddlewareContext, middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { logAndThrow } from "./lib/validations"
import { boolean, string, object } from "yup"
import {
   AddSparkSparkData,
   DeleteSparkData,
   UpdateSparkData,
   sparksCategoriesArray,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { groupRepo, sparkRepo } from "./api/repositories"

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

            return sparkRepo.create(data, group, creator)
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

            return sparkRepo.update(data, creator)
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
            return sparkRepo.delete(data.id)
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

const commonSparkActions = async (
   data: any,
   context: MiddlewareContext<Record<string, unknown>>
) => {
   const group = context.middlewares.group as Group

   const creator = await groupRepo.getCreatorById(group.id, data.creatorId)

   if (!creator) {
      logAndThrow("Creator not found", {
         data,
         context,
      })
   }

   return { group, creator }
}

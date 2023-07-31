import functions = require("firebase-functions")
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import {
   dataValidation,
   userShouldBeGroupAdmin,
} from "./middlewares/validations"
import { logAndThrow } from "./lib/validations"
import { boolean, string } from "yup"
import {
   AddSparkSparkData,
   sparksCategoriesArray,
} from "@careerfairy/shared-lib/sparks/sparks"
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { groupRepo, sparkRepo } from "./api/repositories"

export const createSpark = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation({
         question: string()
            .required()
            .max(SPARK_CONSTANTS.QUESTION_MAX_LENGTH)
            .min(SPARK_CONSTANTS.QUESTION_MIN_LENGTH),
         categoryId: string()
            .oneOf(sparksCategoriesArray.map((category) => category.id))
            .required("Category is required"),
         videoId: string().required(),
         published: boolean().required(),
         videoUrl: string().required(),
         creatorId: string().required(),
         groupId: string().required(),
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

import functions = require("firebase-functions")
import { Group } from "@careerfairy/shared-lib/groups"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import {
   AddSparkSparkData,
   DeleteSparkData,
   UpdateSparkData,
   sparksCategoriesArray,
   Spark,
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
import { Creator } from "@careerfairy/shared-lib/groups/creators"

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

const validateGroupSparks = async (group: Group) => {
   try {
      const { groupId, publicSparks } = group

      // get all the creators from a group
      const creators: Creator[] = await groupRepo.getCreators(groupId)

      // if the groups has 3 or more creators, validation continues
      if (
         creators?.length >= SPARK_CONSTANTS.MINIMUM_CREATORS_TO_PUBLISH_SPARKS
      ) {
         // get all the sparks from a Group
         const sparks = await sparkRepo.getSparksByGroupId(groupId)
         let sparksPerCreatorCounter = 0

         const isValid = creators?.some(({ id: creatorId }) => {
            // filter all the public sparks per Creator
            const numberOfPublicSparks = sparks?.filter(
               (spark: Spark) =>
                  spark.creator.id === creatorId && spark.published === true
            ).length

            functions.logger.log(
               `Creator ${creatorId}, has ${numberOfPublicSparks} public Sparks`
            )

            if (
               numberOfPublicSparks >=
               SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
            ) {
               sparksPerCreatorCounter++
            }

            return (
               sparksPerCreatorCounter ===
               SPARK_CONSTANTS.MINIMUM_CREATORS_TO_PUBLISH_SPARKS
            )
         })

         if (isValid) {
            if (publicSparks) {
               return functions.logger.log(
                  `After validation, the group ${groupId} continues to have public sparks`
               )
            }

            functions.logger.log(
               `After validation, the group ${groupId} is able to have public sparks`
            )
            return groupRepo.updatePublicSparks(groupId, true)
         }

         if (
            sparksPerCreatorCounter <
            SPARK_CONSTANTS.MINIMUM_CREATORS_TO_PUBLISH_SPARKS
         ) {
            // To be here, it means that the group has {MINIMUM_CREATORS_TO_PUBLISH_SPARKS} or more creators
            // but does not have at least {MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS} sparks for {MINIMUM_CREATORS_TO_PUBLISH_SPARKS} different creators
            // which means this group should not have their sparks public

            // only update if needed
            if (publicSparks) {
               functions.logger.log(
                  `After validation, the group ${groupId} does no longer have public sparks`
               )
               return groupRepo.updatePublicSparks(groupId, false)
            }

            return functions.logger.log(
               `After validation, the group ${groupId} has more than ${SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS} Creators but less than ${SPARK_CONSTANTS.MINIMUM_CREATORS_TO_PUBLISH_SPARKS} Sparks per Creator`
            )
         }
      }

      // To be here, it means that the group has less than {MINIMUM_CREATORS_TO_PUBLISH_SPARKS} creators
      // which means this group should not have their sparks public

      // only update if needed
      if (publicSparks) {
         return groupRepo.updatePublicSparks(groupId, false)
      }

      functions.logger.log(
         `After validation, the group ${groupId} has less than ${SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS} Creators`
      )
   } catch (error) {
      return functions.logger.error("Error during Spark validation", { error })
   }
}

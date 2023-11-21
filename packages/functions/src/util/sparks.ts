import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Timestamp } from "../api/firestoreAdmin"
import { Group } from "@careerfairy/shared-lib/groups"
import { groupRepo, sparkRepo } from "../api/repositories"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import functions = require("firebase-functions")
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

/**
 * Adds the current timestamp to the "addedToFeedAt" field of a spark.
 *
 * @param spark - The spark to which the timestamp will be added
 */
export const addAddedToFeedAt = (spark: Spark) => {
   spark.addedToFeedAt = Timestamp.now()
}

/**
 * This function validates the sparks of a group. It checks if the group is public,
 * if it has the minimum number of creators required to publish sparks, and if each creator
 * has the minimum number of sparks required to publish sparks.
 * If these conditions are met, the group's sparks are made public.
 * If not, the group's sparks are not made public.
 *
 * @param group - The group whose sparks are to be validated
 */
export const validateGroupSparks = async (group: Group) => {
   try {
      const groupPresenter = GroupPresenter.createFromDocument(group)

      const { id: groupId, publicSparks, publicProfile } = groupPresenter

      const minCreatorsToPublishSparks =
         groupPresenter.getMinimumCreatorsToPublishSparks()
      const minSparksPerCreatorToPublishSparks =
         groupPresenter.getMinimumSparksPerCreatorToPublishSparks()

      // If the group is not yet a public group there's no need to do all the other validations
      if (!publicProfile) {
         functions.logger.log(
            `Group ${groupId} is not yet public so theres no possibility to have public sparks`
         )

         // only update if needed
         if (publicSparks) {
            return groupRepo.updatePublicSparks(groupId, false)
         }

         return
      }

      // get all the creators from a group
      const creators: Creator[] = await groupRepo.getCreators(groupId)

      // if the groups has 3 or more creators, validation continues
      if (creators?.length >= minCreatorsToPublishSparks) {
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

            if (numberOfPublicSparks >= minSparksPerCreatorToPublishSparks) {
               sparksPerCreatorCounter++
            }

            return sparksPerCreatorCounter === minCreatorsToPublishSparks
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

         if (sparksPerCreatorCounter < minCreatorsToPublishSparks) {
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
               `After validation, the group ${groupId} has more than ${minSparksPerCreatorToPublishSparks} Creators but less than ${minCreatorsToPublishSparks} Sparks per Creator`
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
         `After validation, the group ${groupId} has less than ${minSparksPerCreatorToPublishSparks} Creators`
      )
   } catch (error) {
      return functions.logger.error("Error during Spark validation", { error })
   }
}

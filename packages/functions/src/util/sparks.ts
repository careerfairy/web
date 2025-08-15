import { Group } from "@careerfairy/shared-lib/groups"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Timestamp } from "../api/firestoreAdmin"
import { groupRepo, sparkRepo } from "../api/repositories"
import functions = require("firebase-functions")

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

      const minTotalPublishedSparksToMakeGroupSparksPublic =
         groupPresenter.getMinimumTotalPublishedSparksToMakeGroupSparksPublic()

      // If the groups current plan has expired no need for the other validations and set publicSparks = false
      if (hasGroupPlanExpired(group)) {
         // only update if needed
         if (publicSparks) {
            return groupRepo.updatePublicSparks(groupId, false)
         }
         return
      }

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

      // if the groups has {MINIMUM_CREATORS_TO_MAKE_GROUP_SPARKS_PUBLIC} or more creators, validation continues
      if (creators?.length > 0) {
         // get all the sparks from a Group
         const sparks = await sparkRepo.getSparksByGroupId(groupId)
         let totalPublishedSparksCounter = 0

         creators.forEach(({ id: creatorId }) => {
            // Count the number of published sparks for a specific creator
            const numberOfPublishedSparksPerCreator =
               sparks.filter(
                  (spark) => spark.creator.id === creatorId && spark.published
               ).length || 0

            functions.logger.log(
               `Creator ${creatorId}, has ${numberOfPublishedSparksPerCreator} published Sparks`
            )

            totalPublishedSparksCounter += numberOfPublishedSparksPerCreator
         })

         const isValid =
            totalPublishedSparksCounter >=
            minTotalPublishedSparksToMakeGroupSparksPublic

         if (isValid) {
            functions.logger.log(
               `After validation, the group ${groupId} is now able to have public sparks setting publicSparks to true`
            )
            return groupRepo.updatePublicSparks(groupId, true)
         } else {
            functions.logger.log(
               `After validation, the group ${groupId} is not able to have public sparks setting publicSparks to false`
            )
            return groupRepo.updatePublicSparks(groupId, false)
         }
      } else {
         /**
          * To be here, it means that the group has less than {MINIMUM_CREATORS_TO_MAKE_GROUP_SPARKS_PUBLIC}
          * which means this group should not have their sparks public
          */

         // only update if needed
         if (publicSparks) {
            return groupRepo.updatePublicSparks(groupId, false)
         }

         functions.logger.log(
            `After validation, the group ${groupId} has no creators so it should not have public sparks`
         )
      }
   } catch (error) {
      return functions.logger.error("Error during Spark validation", { error })
   }
}

function hasGroupPlanExpired(group: Group): boolean {
   if (group.plan?.expiresAt.toMillis() < Date.now()) {
      return true
   }
   return false
}

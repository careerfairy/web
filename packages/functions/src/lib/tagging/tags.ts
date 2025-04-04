import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   getArrayDifference,
   removeDuplicates,
} from "@careerfairy/shared-lib/utils"
import * as functions from "firebase-functions"
import _ from "lodash"

import config from "../../config"
import {
   CacheKeyOnCallFn,
   cacheOnCallValues,
} from "../../middlewares/cacheMiddleware"
import { middlewares } from "../../middlewares/middlewares"
import { getChangeTypes } from "../../util"
import { knownIndexes } from "../search/searchIndexes"
import { initAlgoliaIndex } from "../search/util"
import { TagsService } from "./services/TagsService"
/**
 * Generate cache key for the fn call
 */
export const cacheKey = () => {
   return ["fetchContentHits"]
}
// cache settings for tag hits
const cacheTagHits = (cacheKeyFn: CacheKeyOnCallFn) =>
   cacheOnCallValues("tag", cacheKeyFn, 21600) // 6 hours
/**
 * Synchronizes all of linked content tags (@field linkedCustomJobsTagIds of @type LivestreamEvent | Spark) related to a customJob (livestream, sparks, or future content).
 * Based on an operation on a customJob (create, update or delete), determines which linked content needs updating of @field linkedCustomJobsTagIds, taking into consideration
 * its existing relationship with other customJobs and their tags.
 *
 *
 * As linked content when associated with a customJob can be set in different fields (currently "livestreams" and "sparks") and these will defer
 * in types, the parameters linkedContentIdsGetter and customJobsByLinkedContentFetcher, allows the generic retrieval of the content ids and also
 * allows fetching of other customJobs related to said content which is then used for calculating the latest tags based on all customJobs for the same
 * content.
 * @param afterJob customJob after a change, when the operation is delete it will be null. Delete check is made first and the @param afterJob is not used
 * in that scenario. This parameter can also be null when local testing, as initially firefoo creates an empty object.
 * @param beforeJob customJob before a change, during create it can be null and the code is ready to deal with null cases for the @param beforeJob.
 * @param changeType Type of change being made on a customJob (create, update or delete).
 * @param linkedContentIdsGetter Function which allows to get the ids of the linked content.
 * @param linkedContentFetcher Function which allows to fetch the linked content by providing a list of content ids.
 * @param customJobsByLinkedContentFetcher Functions which allows to fetch all of customJobs associated to a content.
 * @returns LinkedContentType Generic type with the content having the @field linkedCustomJobsTagIds updated with the
 * latest data after the customJob has been modified. This data is ready to be saved and only modifies linkedCustomJobsTagIds.
 * This can be @type LivestreamEvent[] or Spark[].
 */
export const syncCustomJobLinkedContentTags = async <
   LinkedContentType extends LivestreamEvent | Spark
>(
   afterJob: CustomJob,
   beforeJob: CustomJob,
   changeType: ReturnType<typeof getChangeTypes>,
   linkedContentIdsGetter: (job: CustomJob) => string[],
   linkedContentFetcher: (contentIds: string[]) => Promise<LinkedContentType[]>,
   customJobsByLinkedContentFetcher: (
      contentIds: string[]
   ) => Promise<CustomJob[]>
): Promise<LinkedContentType[]> => {
   if (changeType.isDelete) {
      return mergeDeletedCustomJobLinkedContentTags(
         beforeJob,
         changeType,
         linkedContentIdsGetter,
         linkedContentFetcher,
         customJobsByLinkedContentFetcher
      )
   }
   const businessFunctionTagsChanged = Boolean(
      _.xor(
         afterJob?.businessFunctionsTagIds ?? [],
         beforeJob?.businessFunctionsTagIds ?? []
      ).length
   )

   const afterJobLinkedContentIds = linkedContentIdsGetter(afterJob) ?? []
   const beforeJobLinkedContentIds = linkedContentIdsGetter(beforeJob) ?? []

   const hasLinkedContent = Boolean(linkedContentIdsGetter(afterJob)?.length)

   const addedContent = getArrayDifference(
      beforeJobLinkedContentIds,
      afterJobLinkedContentIds
   ) as string[]

   const removedContent = getArrayDifference(
      afterJobLinkedContentIds,
      beforeJobLinkedContentIds
   ) as string[]

   if (!hasLinkedContent && !removedContent.length) return []

   const allEffectedContentIds = removedContent.concat(afterJobLinkedContentIds)

   const contentData = await linkedContentFetcher(allEffectedContentIds)

   const customJobs = await customJobsByLinkedContentFetcher(
      allEffectedContentIds
   )

   const contentCustomJobsTagMap = contentCustomJobsExcludingMap(
      afterJob,
      allEffectedContentIds,
      customJobs,
      linkedContentIdsGetter
   )
   const results = []
   // When a customJob is being updated or created, if there are no tags, nothing to do
   if (changeType.isCreate || changeType.isUpdate) {
      if (hasLinkedContent) {
         let contentToUpdate = addedContent

         // Less updates by only updating the current linked events when the tag has changed
         // other wise the tags sync will only be for the added content
         if (businessFunctionTagsChanged) {
            contentToUpdate = linkedContentIdsGetter(afterJob)
         }
         // Update content tags for all events still on the customJob (update or create)
         // Filter the snapshots as the query includes also removed content from the customJob
         contentData
            ?.filter(
               (content) => content?.id && contentToUpdate.includes(content.id)
            )
            ?.map((contentDoc) => {
               // Forces refresh of tags based on latest data
               const contentTagsExcludingCurrentJob =
                  contentCustomJobsTagMap[contentDoc.id]

               const tags = contentTagsExcludingCurrentJob.concat(
                  afterJob.businessFunctionsTagIds ?? []
               )
               // Always remove duplicates as adding or removing can produce duplicates
               const mergedTags = removeDuplicates(tags)
               return {
                  ...contentDoc,
                  linkedCustomJobsTagIds: mergedTags,
               }
            })
            ?.forEach((content) => results.push(content))
      }

      if (removedContent.length) {
         contentData
            ?.filter((content) => {
               return content?.id && removedContent.includes(content.id)
            })
            ?.map((contentDoc) => {
               // When removing, keep only tags which were inferred by other custom jobs (other the one being updated)
               const mergedTags = removeDuplicates(
                  contentCustomJobsTagMap[contentDoc.id]
               )

               return {
                  ...contentDoc,
                  linkedCustomJobsTagIds: mergedTags,
               }
            })
            ?.forEach((content) => results.push(content))
      }
   }

   return results
}

const mergeDeletedCustomJobLinkedContentTags = async <
   LinkedContentType extends LivestreamEvent | Spark
>(
   beforeJob: CustomJob,
   changeType: ReturnType<typeof getChangeTypes>,
   linkedContentIdsGetter: (job: CustomJob) => string[],
   linkedContentFetcher: (contentIds: string[]) => Promise<LinkedContentType[]>,
   customJobsByLinkedContentFetcher: (
      contentIds: string[]
   ) => Promise<CustomJob[]>
): Promise<LinkedContentType[]> => {
   if (!changeType.isDelete) return []
   const linkedContentIds = linkedContentIdsGetter(beforeJob)
   if (!linkedContentIds.length || !beforeJob.businessFunctionsTagIds?.length)
      return []

   const contentData = await linkedContentFetcher(linkedContentIds)

   const customJobs = await customJobsByLinkedContentFetcher(linkedContentIds)

   const contentsCustomJobsTagMap = contentCustomJobsExcludingMap(
      beforeJob,
      linkedContentIdsGetter(beforeJob) ?? [],
      customJobs,
      linkedContentIdsGetter
   )

   // Remove all job tags from beforeJob for all linked content
   if (contentData.length) {
      // Update content tags for all content still on the customJob (update or create)
      // Filter the snapshots as the query includes also removed content from the customJob
      return contentData
         ?.filter((content) => linkedContentIds.includes(content.id))
         ?.map((contentDoc) => {
            const eventLinkedJobTags = contentDoc.linkedCustomJobsTagIds ?? []
            const eventTagsExcludingCurrentJob =
               contentsCustomJobsTagMap[contentDoc.id]

            const tagsData = eventLinkedJobTags.filter((jobTag) => {
               return (
                  eventTagsExcludingCurrentJob.includes(jobTag) ||
                  !beforeJob.businessFunctionsTagIds.includes(jobTag)
               )
            })

            // Always remove duplicates as adding or removing can produce duplicates
            const mergedTags = removeDuplicates(tagsData)

            return {
               ...contentDoc,
               linkedCustomJobsTagIds: mergedTags,
            }
         })
   }
   return []
}

/**
 * Create a map allowing to retrieve for a given content id, all of the
 * @field businessFunctionsTagIds of @type CustomJob, for all custom jobs associated to that content
 * while ignoring the tags associated via the current custom job, which will be needed when
 * a custom job is deleted, only its tags are to be removed from the content, tags inferred from other
 * jobs must still remain.
 */
const contentCustomJobsExcludingMap = (
   excludingJob: CustomJob,
   linkedContentIds: string[],
   allCustomJobs: CustomJob[],
   linkedContentIdsGetter: (job: CustomJob) => string[]
) => {
   return Object.fromEntries(
      linkedContentIds.map((id) => {
         const eventJobs =
            allCustomJobs?.filter((job) =>
               linkedContentIdsGetter(job).includes(id)
            ) || []
         const unrelatedCustomJobsTags = eventJobs
            .filter((job) => job.id != excludingJob.id)
            .map((job) => job.businessFunctionsTagIds)
            .flat()
            .filter(Boolean)

         return [id, unrelatedCustomJobsTags]
      })
   )
}

/**
 * Counts all tags (business functions, content topics and languages) based on linked content, namely
 * Sparks and livestreams, calculating how many hits each tag has in terms of content.
 */
export const fetchContentHits = functions.region(config.region).https.onCall(
   middlewares(
      cacheTagHits(() => cacheKey()),
      async () => {
         functions.logger.info("Fetching tags content hits")

         const livestreamIndex = initAlgoliaIndex(
            knownIndexes.livestreams.indexName
         )

         const sparksIndex = initAlgoliaIndex(knownIndexes.sparks.indexName)
         const tagsService = new TagsService(livestreamIndex, sparksIndex)

         const hits = await tagsService.countHits()

         functions.logger.info("Fetched tags content hits - ", hits)
         return hits
      }
   )
)

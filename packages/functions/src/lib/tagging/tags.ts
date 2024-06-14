import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   getArrayDifference,
   removeDuplicates,
} from "@careerfairy/shared-lib/utils"
import _ from "lodash"
import { getChangeTypes } from "src/util"
// TODO: Update documentation

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

   const hasLinkedContent = Boolean(linkedContentIdsGetter(afterJob))

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
            ?.filter((content) => contentToUpdate.includes(content.id))
            ?.map((contentDoc) => {
               // Forces refresh of tags based on latest data
               const contentTagsExcludingCurrentJob =
                  contentCustomJobsTagMap[contentDoc.id]
               // Always remove duplicates as adding or removing can produce duplicates
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
               return removedContent.includes(content.id)
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

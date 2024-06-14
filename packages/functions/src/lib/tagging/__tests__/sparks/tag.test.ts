import { Identifiable } from "@careerfairy/shared-lib/commonTypes"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { syncCustomJobLinkedContentTags } from "../../tags"
import {
   createNewAndOldCustomJobData,
   createNewCustomJobsData,
   createNewSparksData,
} from "../../testHelpers"
import { getCustomJobsByLinkedContentIds } from "../../utils/utils"

const getId = <T extends Identifiable>(data: T) => data.id

const sparksWithoutTags = createNewSparksData(4)

// These sparks must be referenced by at least a custom job with these tags
const sparksWithExistingTags = createNewSparksData(5, {
   linkedCustomJobsTagIds: [
      "SupplyChainLogistics",
      "ProductManagement",
      "ResearchDevelopment",
   ],
})

// Not used when creating customJob global data, meaning can be used for creating
// local customJobs only linked to these events, useful for testing
// deleting customJobs and the events only linked to that customJob
// must have its tags removed
const singleLinkSparksWithExistingTags = createNewSparksData(6, {
   linkedCustomJobsTagIds: ["SupplyChainLogistics", "ProductManagement"],
})

const allSparks = sparksWithoutTags
   .concat(sparksWithExistingTags)
   .concat(singleLinkSparksWithExistingTags)

const customJobsWithSparks = createNewCustomJobsData(2, {
   sparks: sparksWithExistingTags.map(getId),
   businessFunctionTagIds: [
      "SupplyChainLogistics",
      "ProductManagement",
      "ResearchDevelopment",
   ],
})

const allCustomJobs = createNewCustomJobsData(2).concat(customJobsWithSparks)

describe("Adding business function tags to customJobs - Sparks", () => {
   test("Should not update linked sparks content when the custom job tags does not change", async () => {
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: allSparks.map(getId),
               businessFunctionTagIds: ["Legal"],
            },
            {
               sparks: allSparks.map(getId),
               businessFunctionTagIds: ["Legal"],
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(0)
   })

   test("Should update spark tags when customJob tag is added", async () => {
      const addedTags = ["Legal", "Finance"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithoutTags.map(getId),
               businessFunctionTagIds: addedTags,
            },
            {
               sparks: sparksWithoutTags.map(getId),
               businessFunctionTagIds: [],
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: true, isUpdate: false, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(sparksWithoutTags.length)
      updatedLinkedSparksContent.forEach((updatedSpark) => {
         expect(updatedSpark.linkedCustomJobsTagIds.length).toBe(
            addedTags.length
         )
         expect(updatedSpark.linkedCustomJobsTagIds).toStrictEqual(addedTags)
      })
   })

   test("Should update spark tags when customJob tag is removed", async () => {
      const updatedTags = ["Legal"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithoutTags.map(getId),
               businessFunctionTagIds: updatedTags,
            },
            {
               sparks: sparksWithoutTags.map(getId),
               businessFunctionTagIds: ["Legal", "Finance"],
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(sparksWithoutTags.length)
      updatedLinkedSparksContent.forEach((updatedSpark) => {
         expect(updatedSpark.linkedCustomJobsTagIds).toStrictEqual(updatedTags)
      })
   })

   test("Should clear spark (associated to single job) tags when customJob is deleted", async () => {
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: [
                  "SupplyChainLogistics",
                  "ProductManagement",
               ],
            },
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: [
                  "SupplyChainLogistics",
                  "ProductManagement",
               ],
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(
         sparksWithExistingTags.length
      )
      updatedLinkedSparksContent.forEach((updatedSpark) => {
         expect(updatedSpark.linkedCustomJobsTagIds.length).not.toBe(0)
         expect(sparksWithExistingTags.map(getId)).toContain(updatedSpark.id)
      })
   })

   test("Should clear spark (associated to multiple jobs) tags only from deleted job tags when customJob is deleted", async () => {
      const jobTags = ["Legal", "Finance"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(
         sparksWithExistingTags.length
      )
      updatedLinkedSparksContent.forEach((updatedEvent) => {
         expect(updatedEvent.linkedCustomJobsTagIds.length).toBeGreaterThan(0)
         expect(updatedEvent.linkedCustomJobsTagIds).not.toContain(jobTags)
      })
   })

   test("Should remove spark tags if link is removed from customJob", async () => {
      const jobTags = ["SupplyChainLogistics", "ProductManagement"]

      const removedSpark = singleLinkSparksWithExistingTags.at(0)
      const newSparkIds = singleLinkSparksWithExistingTags.slice(1).map(getId)
      const oldSparkIds = singleLinkSparksWithExistingTags.map(getId)
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: newSparkIds,
               businessFunctionTagIds: jobTags,
            },
            {
               sparks: oldSparkIds,
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )
      // One spark was removed so only one update to be done
      expect(updatedLinkedSparksContent.length).toBe(1)
      expect(updatedLinkedSparksContent.at(0).id).toBe(removedSpark.id)
      expect(
         updatedLinkedSparksContent.at(0).linkedCustomJobsTagIds.length
      ).toBe(0)
   })

   test("Should add spark tags if link is added to customJob", async () => {
      const sparksToAdd = createNewSparksData(15)

      // Add to global sparks to be able to be fetched
      sparksToAdd.forEach((spark) => allSparks.push(spark))

      const addedIds = sparksToAdd.map(getId)

      const tags = ["Legal", "Finance"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithoutTags.concat(sparksToAdd).map(getId),
               businessFunctionTagIds: tags,
            },
            {
               sparks: sparksWithoutTags.map(getId),
               businessFunctionTagIds: tags,
            }
         )

      const updatedLinkedSparks = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: true, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparks.length).toBe(addedIds.length)
      updatedLinkedSparks.forEach((updatedSpark) => {
         expect(addedIds).toContain(updatedSpark.id)
         expect(updatedSpark.linkedCustomJobsTagIds.length).toBe(tags.length)
         expect(updatedSpark.linkedCustomJobsTagIds).toStrictEqual(tags)
      })
   })

   test("Should not remove tag after deleting customJob if spark is linked to another customJob with same tag", async () => {
      // The linked sparks have this tag and others, deleting this job means no tag shall
      // be deleted, as it is present in the sparks via other customJob (defined globally)
      const jobTags = [
         "SupplyChainLogistics",
         "ProductManagement",
         "ResearchDevelopment",
      ]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: false, isUpdate: false, isDelete: true },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(
         sparksWithExistingTags.length
      )
      updatedLinkedSparksContent.forEach((updatedSpark) => {
         expect(updatedSpark.linkedCustomJobsTagIds.length).toBe(jobTags.length)
         expect(updatedSpark.linkedCustomJobsTagIds).toStrictEqual(jobTags)
      })
   })

   test("Should not duplicate tag, if spark has already the same tag from other customJob - create", async () => {
      const jobTags = ["ResearchDevelopment"]
      const { newCustomJobData: newJob, oldCustomJobData: oldJob } =
         createNewAndOldCustomJobData(
            {
               sparks: sparksWithExistingTags.map(getId),
               businessFunctionTagIds: jobTags,
            },
            {
               sparks: [],
               businessFunctionTagIds: [],
            }
         )

      const updatedLinkedSparksContent = await syncCustomJobLinkedContentTags(
         newJob,
         oldJob,
         { isCreate: true, isUpdate: false, isDelete: false },
         (job) => job.sparks,
         getSparksByIds,
         (sparkIds) =>
            getCustomJobsByLinkedContentIds(allCustomJobs, "sparks", sparkIds)
      )

      expect(updatedLinkedSparksContent.length).toBe(
         sparksWithExistingTags.length
      )
      updatedLinkedSparksContent.forEach((updatedSpark) => {
         expect(updatedSpark.linkedCustomJobsTagIds).toStrictEqual(
            sparksWithExistingTags.at(0).linkedCustomJobsTagIds
         )
      })
   })

   // Sparks
})

const getSparksByIds = (ids: string[]): Promise<Spark[]> => {
   return Promise.resolve(allSparks.filter((spark) => ids.includes(spark.id)))
}

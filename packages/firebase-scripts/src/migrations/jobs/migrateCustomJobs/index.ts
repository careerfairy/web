import {
   CustomJob,
   CustomJobApplicant,
   CustomJobStats,
} from "@careerfairy/shared-lib/src/groups/customJobs"
import { firestore } from "../../../lib/firebase"
import { groupRepo, userRepo } from "../../../repositories"
import { BulkWriter } from "firebase-admin/firestore"

/**
 * Helper function to create a new CustomJob document in /customJobs collection
 * The data is based on the provided customJob object
 * @param customJob - The custom job to be created
 * @param bulkWriter - The Firestore BulkWriter to use for batch operations
 * @returns The newly created custom job
 */
function createCustomJobInCollection(
   customJob: CustomJob,
   bulkWriter: BulkWriter
) {
   // Copy the customJob object to avoid mutating the original object
   const newCustomJob: CustomJob = {
      ...customJob,
   }

   // remove fields that are no longer needed
   delete newCustomJob.clicks // clicks are now stored in /customJobStats/[jobId] document
   delete newCustomJob.applicants // applicants are now stored in /customJobs/[jobId]/applicants collection

   const newCustomJobRef = firestore.collection("customJobs").doc(customJob.id)
   bulkWriter.set(newCustomJobRef, newCustomJob)

   return newCustomJob
}

/**
 * Helper function to create a CustomJobStats document in /customJobStats collection
 * The data is based on the provided customJob and newCustomJob objects
 * @param customJob - The custom job to be created
 * @param newCustomJob - The newly created custom job
 * @param bulkWriter - The Firestore BulkWriter to use for batch operations
 */
function createCustomJobStatsInCollection(
   customJob: CustomJob,
   newCustomJob: CustomJob,
   bulkWriter: BulkWriter
) {
   const customJobStats: CustomJobStats = {
      jobId: customJob.id,
      documentType: "customJobStats",
      clicks: customJob.clicks ?? 0,
      job: newCustomJob,
      id: customJob.id,
   }

   const customJobStatsRef = firestore
      .collection("customJobStats")
      .doc(customJob.id)

   bulkWriter.set(customJobStatsRef, customJobStats)
}

/**
 * Helper function to create CustomJobApplicant documents in /customJobs/[jobId]/applicants collection
 * The data is based on the provided customJob object and the user data retrieved by the applicantId
 * @param customJob - The custom job to be created
 * @param bulkWriter - The Firestore BulkWriter to use for batch operations
 */
async function createCustomJobApplicantsInCollection(
   customJob: CustomJob,
   bulkWriter: BulkWriter
) {
   const applicantPromises = customJob.applicants.map((applicantId) =>
      userRepo.getUserDataById(applicantId)
   )
   const applicantsData = await Promise.all(applicantPromises)

   applicantsData.forEach((userData, index) => {
      if (userData) {
         // Check if user data exists
         const applicantId = customJob.applicants[index]

         const customJobApplicant: CustomJobApplicant = {
            documentType: "customJobApplicant",
            jobId: customJob.id,
            user: userData,
            id: applicantId,
         }
         const customJobApplicantRef = firestore
            .collection("customJobs")
            .doc(customJob.id)
            .collection("applicants")
            .doc(applicantId)
         bulkWriter.set(customJobApplicantRef, customJobApplicant)
      }
   })
}

/**
 * Main function to run the migration
 * It retrieves all groups and their custom jobs, then creates new documents in the appropriate collections
 */
export async function run() {
   const bulkWriter = firestore.bulkWriter()
   const groups = await groupRepo.getAllGroups()

   for (const group of groups) {
      const customJobs = await groupRepo.getGroupCustomJobs(group.id)
      for (const customJob of customJobs) {
         const newCustomJob = createCustomJobInCollection(customJob, bulkWriter)
         createCustomJobStatsInCollection(customJob, newCustomJob, bulkWriter)
         await createCustomJobApplicantsInCollection(customJob, bulkWriter)
      }
   }

   await bulkWriter.close()
}

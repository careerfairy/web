import {
   CustomJob,
   CustomJobApplicant,
   CustomJobStats,
} from "@careerfairy/shared-lib/src/groups/customJobs"
import { firestore } from "../../../lib/firebase"
import { groupRepo, userRepo } from "../../../repositories"
import { BulkWriter } from "firebase-admin/firestore"
import * as cliProgress from "cli-progress"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import Counter from "../../../lib/Counter"
import { logAction } from "../../../util/logger"

const jobProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Processing Custom Jobs", "Custom Jobs Processed"),
   cliProgress.Presets.shades_classic
)

/**
 * Helper function to create a new CustomJob document in /customJobs collection
 * The data is based on the provided customJob object
 * @param customJob - The custom job to be created
 * @param bulkWriter - The Firestore BulkWriter to use for batch operations
 * @returns The newly created custom job
 */
function createCustomJobInCollection(
   customJob: CustomJob,
   bulkWriter: BulkWriter,
   counter: Counter
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
   counter.writeIncrement()
   counter.customCountIncrement("Migrated Custom Jobs")

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
   bulkWriter: BulkWriter,
   counter: Counter
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
   counter.writeIncrement()
   counter.customCountIncrement("Migrated Custom Job Stats")
}

/**
 * Helper function to create CustomJobApplicant documents in /jobApplications collection
 * The data is based on the provided customJob object and the user data retrieved by the applicantId.
 * The ID of the document is a combination of the customJob ID and the applicant's email address eg. "customJobId_applicantEmail"
 * @param customJob - The custom job to be created
 * @param bulkWriter - The Firestore BulkWriter to use for batch operations
 */
async function createCustomJobApplicantsInCollection(
   customJob: CustomJob,
   bulkWriter: BulkWriter,
   counter: Counter
) {
   if (!Array.isArray(customJob.applicants) || !customJob.applicants.length) {
      return // No applicants to migrate skip...
   }

   const applicantPromises = customJob.applicants.map((applicantId) =>
      userRepo.getUserDataById(applicantId)
   )

   const applicantsData = (await Promise.all(applicantPromises)) || []
   counter.addToReadCount(applicantPromises.length)

   applicantsData.forEach((userData, index) => {
      if (userData) {
         // Check if user data exists
         const userEmail = customJob.applicants[index]

         const applicationId = `${customJob.id}_${userEmail}`

         const customJobApplicant: CustomJobApplicant = {
            documentType: "customJobApplicant",
            jobId: customJob.id,
            user: userData,
            id: applicationId,
            appliedAt: customJob.createdAt ?? (new Date() as any), // js Dates get converted to Timestamps
            groupId: customJob.groupId ?? null,
            livestreamId: customJob.livestreams?.[0] ?? null, // default to first livestream for migration
         }

         const customJobApplicantRef = firestore
            .collection("jobApplications")
            .doc(applicationId)

         bulkWriter.set(customJobApplicantRef, customJobApplicant)
         counter.writeIncrement()
         counter.customCountIncrement("Migrated Applicants")
      }
   })
}

const counter = new Counter()

/**
 * Main function to run the migration
 * It retrieves all groups and their custom jobs, then creates new documents in the appropriate collections
 */
export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      const customJobs = await logAction(
         () => groupRepo.getAllCustomJobs(),
         "Fetching all custom jobs"
      )

      counter.addToReadCount(customJobs.length)

      jobProgressBar.start(customJobs.length, 0)

      for (const customJob of customJobs) {
         const newCustomJob = createCustomJobInCollection(
            customJob,
            bulkWriter,
            counter
         )
         createCustomJobStatsInCollection(
            customJob,
            newCustomJob,
            bulkWriter,
            counter
         )
         await createCustomJobApplicantsInCollection(
            customJob,
            bulkWriter,
            counter
         )

         jobProgressBar.increment()
      }

      jobProgressBar.stop()

      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

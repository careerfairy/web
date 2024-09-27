import { CustomJobApplicant } from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { customJobRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"

const RUNNING_VERSION = "0.1"
const counter = new Counter()

export async function run() {
   try {
      Counter.log(
         `Fetching data for Backfilling Job Applications: adding removedFromUserProfile if undefined - v${RUNNING_VERSION}`
      )

      const allJobApplications = await logAction(
         () => customJobRepo.getAllJobApplications(false),
         "Fetching all Job Applications"
      )

      const jobApplicationsToUpdate = (allJobApplications || []).filter(
         (jobApplication) => jobApplication.removedFromUserProfile === undefined
      )

      Counter.log(`Fetched ${jobApplicationsToUpdate.length} Job Applications`)

      counter.addToReadCount(jobApplicationsToUpdate.length)

      await backfillJobApplications(jobApplicationsToUpdate)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillJobApplications = async (
   jobApplications: CustomJobApplicant[]
) => {
   const batchSize = 200 // Batch size for firestore, 200 or fewer works consistently

   const totalDocs = jobApplications
   const totalNumDocs = jobApplications.length

   writeProgressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const batch = firestore.batch()

      const customJobsApplicantsChunk = totalDocs.slice(i, i + batchSize) // Slice the data into batches

      customJobsApplicantsChunk.forEach((customJobApplicant) => {
         writeProgressBar.increment() // Increment progress bar

         const jobApplicationRef = firestore
            .collection("jobApplications")
            .doc(customJobApplicant.id)

         const toUpdate: CustomJobApplicant = {
            ...customJobApplicant,
            removedFromUserProfile: false,
         }

         batch.set(jobApplicationRef, toUpdate)

         counter.writeIncrement() // Increment write counter
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}

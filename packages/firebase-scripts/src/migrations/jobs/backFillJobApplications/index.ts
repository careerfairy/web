import { CustomJobApplicant } from "@careerfairy/shared-lib/src/customJobs/customJobs"
import { Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { customJobRepo } from "../../../repositories"
import { writeProgressBar } from "../../../util/bulkWriter"
import { logAction } from "../../../util/logger"
import { throwMigrationError } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const RUNNING_VERSION = "0.1"
const counter = new Counter()

// types
type CustomJobApplicantsWithRef = DataWithRef<true, CustomJobApplicant>

export async function run() {
   try {
      Counter.log(
         `Fetching data for Backfilling Job Applications: adding completed and userId to document - v${RUNNING_VERSION}`
      )

      const [allJobApplications] = await logAction(
         () => Promise.all([customJobRepo.getAllJobApplications(true)]),
         "Fetching all Job Applications"
      )

      Counter.log(`Fetched ${allJobApplications.length} Job Applications`)

      counter.addToReadCount(allJobApplications.length)

      await backfillJobApplications(allJobApplications)
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

const backfillJobApplications = async (
   jobApplications: CustomJobApplicantsWithRef[]
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

         const toUpdate: Pick<CustomJobApplicant, "completed" | "appliedAt"> = {
            completed: true,
            appliedAt: Timestamp.now(),
         }

         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(customJobApplicant._ref as any, toUpdate)
         counter.writeIncrement() // Increment write counter
      })

      await batch.commit() // Wait for batch to commit
   }

   writeProgressBar.stop()
   Counter.log("All Job Applications batches committed! :)")
}

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import * as cliProgress from "cli-progress"
import { SparkStats } from "@careerfairy/shared-lib/dist/sparks/sparks"

const sparksProgressBar = new cliProgress.SingleBar(
   getCLIBarOptions("Processing Sparks", "Sparks Processed"),
   cliProgress.Presets.shades_classic
)

const counter = new Counter()

// eslint-disable-next-line
export async function run() {
   const bulkWriter = firestore.bulkWriter()

   try {
      const sparksStats = await logAction(
         () => groupRepo.getAllSparksStats(),
         "Fetching all Sparks"
      )

      counter.addToReadCount(sparksStats.length)

      sparksProgressBar.start(sparksStats.length, 0)

      const groups = await Promise.all(
         sparksStats.map((stat) => groupRepo.getGroupById(stat.spark.group.id))
      )

      for (const [index, stat] of sparksStats.entries()) {
         const group = groups[index]

         const toUpdate: Partial<SparkStats> = {
            category: stat.spark.category,
            ...(group?.companyIndustries && {
               companyIndustries: group.companyIndustries,
            }),
            ...(group?.companyCountry && {
               companyCountry: group.companyCountry,
            }),
            ...(group?.companySize && { companySize: group.companySize }),
         }

         const sparkStatsRef = firestore.collection("sparkStats").doc(stat.id)

         bulkWriter.update(sparkStatsRef, toUpdate)
         counter.writeIncrement()
         sparksProgressBar.increment()
         counter.customCountIncrement("Update SparkStats")
      }

      sparksProgressBar.stop()
      await logAction(() => bulkWriter.close(), "Closing BulkWriter")
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

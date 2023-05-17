import { UserData, UserStats } from "@careerfairy/shared-lib/dist/users"
import * as cliProgress from "cli-progress"
import { BulkWriter, FieldValue } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { userRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions } from "../../../util/misc"
import { DataWithRef } from "../../../util/types"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      hideCursor: true,
      clearOnComplete: false,
      ...getCLIBarOptions("Writing users & stats", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

// cached globally
let users: DataWithRef<true, UserData>[]
let bulkWriter: BulkWriter

/**
 * Run the migration
 */
export async function run() {
   bulkWriter = firestore.bulkWriter()
   users = await logAction(() => userRepo.getAllUsers(true), "Fetching users")

   bar.start(users.length * 2, 0) // * 2 because we might do 2 writes per user
   counter.addToReadCount(users.length)

   let idx = 0
   for (const user of users) {
      const ref = user._ref

      const userDataToUpdate: Partial<UserData> = {}
      const userStatsToUpdate: Partial<UserStats> = {}

      if (user["referralsCount"]) {
         userDataToUpdate["referralsCount"] = FieldValue.delete()
         // @ts-ignore
         userStatsToUpdate["referralsCount"] = FieldValue.increment(
            user["referralsCount"]
         )
      }

      if (user["totalLivestreamInvites"]) {
         userDataToUpdate["totalLivestreamInvites"] = FieldValue.delete()
         // @ts-ignore
         userStatsToUpdate["totalLivestreamInvites"] = FieldValue.increment(
            user["totalLivestreamInvites"]
         )
      }

      if (Object.keys(userDataToUpdate).length > 0) {
         bulkWriter
            .update(ref as any, userDataToUpdate)
            .then(() => {
               counter.writeIncrement()
            })
            .catch((error) => {
               console.error("bulkWriter.update failed", error)
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })
            .finally(() => {
               bar.increment()
            })

         const statsRef = ref.collection("stats").doc("stats")
         bulkWriter
            .update(statsRef as any, userStatsToUpdate)
            .then(() => {
               counter.writeIncrement()
            })
            .catch((error) => {
               console.error("bulkWriter.update failed", error)
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })
            .finally(() => {
               bar.increment()
            })

         if (++idx % 50 === 0) {
            await bulkWriter.flush()
         }
      }
   }

   await bulkWriter.close()
   bar.stop()
   counter.print()
}

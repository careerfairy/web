import { UserRecord } from "firebase-admin/auth"
import Counter from "../../../lib/Counter"
import { auth, firestore } from "../../../lib/firebase"
import * as cliProgress from "cli-progress"
import { BulkWriter, FieldValue, Timestamp } from "firebase-admin/firestore"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import counterConstants from "../../../lib/Counter/constants"
import { getCLIBarOptions } from "../../../util/misc"

const USER_CHUNKS = 1000
const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Writing user batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

export async function run() {
   const bulkWriter = firestore.bulkWriter()

   // approximate total users we have atm, only used for the loading bar
   bar.start(60_000, 0)

   await getAllAuthUsers(handleUsers(bulkWriter))

   await bulkWriter.close()
   bar.stop()
   counter.print()
}

const handleUsers =
   (bulkWriter: BulkWriter) =>
   async (users: UserRecord[], currentBatch: number) => {
      counter.addToReadCount(users.length)

      for (const user of users) {
         if (!user.email) {
            // console.error("Missing user email, skipped", user)
            counter.addToCustomCount("userWithoutEmail", 1)
            continue
         }

         const userRef = firestore.collection("userData").doc(user.email)
         const data = extractDataToUpdate(user)

         bulkWriter
            .set(userRef, data, { merge: true })
            .then(() => {
               counter.writeIncrement()
            })
            .catch((error) => {
               console.error(
                  "bulkWriter.set failed",
                  error,
                  user,
                  data,
                  currentBatch
               )
               counter.addToCustomCount(counterConstants.numFailedWrites, 1)
            })
            .finally(() => {
               bar.increment()
            })
      }

      // commit all the writes at the end of each batch
      await bulkWriter.flush()
   }

/**
 * Grab the dates from the UserRecord
 */
const extractDataToUpdate = (record: UserRecord) => {
   const toUpdate: Pick<UserData, "lastActivityAt" | "createdAt"> = {
      // populate with the current time as fallback
      lastActivityAt: FieldValue.serverTimestamp() as any, // mismatched types between admin sdk and firestore
      createdAt: FieldValue.serverTimestamp() as any,
   }

   if (record?.metadata?.creationTime) {
      const date = new Date(record.metadata.creationTime)
      toUpdate.createdAt = Timestamp.fromDate(date)
   }

   if (record?.metadata?.lastRefreshTime) {
      const date = new Date(record.metadata.lastRefreshTime)
      toUpdate.lastActivityAt = Timestamp.fromDate(date)
   } else {
      if (record?.metadata?.lastSignInTime) {
         const date = new Date(record.metadata.lastSignInTime)
         toUpdate.lastActivityAt = Timestamp.fromDate(date)
      }
   }

   return toUpdate
}

type HandleAuthUsersFn = (
   users: UserRecord[],
   currentBatch: number
) => Promise<void>

/**
 * Gets all Firebase Auth users, batches of 1000
 * The handlerFn will be called with the users of each batch
 */
const getAllAuthUsers = async (handlerFn: HandleAuthUsersFn) => {
   let nextPageToken: string = undefined
   let batch = 1

   do {
      const result = await auth.listUsers(USER_CHUNKS, nextPageToken)

      try {
         await handlerFn(result.users, batch)
      } catch (error) {
         console.error("Error when calling the handler fn", error)
      }

      nextPageToken = result.pageToken ?? undefined
      batch++
   } while (nextPageToken)
}

import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { Create } from "@careerfairy/shared-lib/dist/commonTypes"
import {
   LivestreamRecordingDetails,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import {
   pickPublicDataFromUser,
   UserActivity,
   UserData,
} from "@careerfairy/shared-lib/dist/users"
import * as cliProgress from "cli-progress"
import { BulkWriter, Timestamp } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo, userRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions } from "../../../util/misc"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      hideCursor: true,
      clearOnComplete: false,
      ...getCLIBarOptions("Writing activities", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

// cached globally
let users: Record<string, UserData>
let userLivestreamData: UserLivestreamData[]
let recordingStats: LivestreamRecordingDetails[]
let bulkWriter: BulkWriter

let activitiesToCreate: Create<UserActivity>[] = []

/**
 * Run the migration
 */
export async function run() {
   bulkWriter = firestore.bulkWriter()
   ;[users, userLivestreamData, recordingStats] = await logAction(
      () =>
         Promise.all([
            userRepo
               .getAllUsers()
               .then((users) => convertDocArrayToDict(users)),
            livestreamRepo.getAllUserLivestreamData(false),
            livestreamRepo.getAllLivestreamRecordingStats(),
         ]),
      "Fetching users, userLivestreamData and recordingStats"
   )

   counter.addToReadCount(
      Object.keys(users).length +
         userLivestreamData.length +
         recordingStats.length
   )

   processUsers(Object.values(users))
   processUserLivestreamData(userLivestreamData)
   processRecordingStats(recordingStats)

   activitiesToCreate = activitiesToCreate.filter((a) => a)
   bar.start(activitiesToCreate.length, 0)

   let idx = 0
   for (const activity of activitiesToCreate) {
      const ref = firestore
         .collection("userData")
         .doc(activity.userId)
         .collection("activities")
         .doc()

      bulkWriter
         .create(ref, activity)
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.create failed", error)
            counter.addToCustomCount(counterConstants.numFailedWrites, 1)
         })
         .finally(() => {
            bar.increment()
         })

      if (++idx % 100 === 0) {
         await bulkWriter.flush()
      }
   }

   await bulkWriter.close()
   bar.stop()
   counter.print()
}

/**
 * Create activities for lastActivityAt and createdAt
 */
function processUsers(users: UserData[]) {
   for (const user of users) {
      if (user.lastActivityAt) {
         activitiesToCreate.push(
            createActivity(
               user.id || user.userEmail,
               "tokenRefresh",
               user.lastActivityAt.toDate()
            )
         )
      }

      if (user.createdAt) {
         activitiesToCreate.push(
            createActivity(
               user.id || user.userEmail,
               "createdAt",
               user.createdAt.toDate()
            )
         )
      }
   }
}

/**
 * Create activities for each recording view
 */
function processRecordingStats(data: LivestreamRecordingDetails[]) {
   for (const recording of data) {
      const futureDate = recording.livestreamStartDate.toDate()
      futureDate.setDate(futureDate.getDate() + 3)

      for (const viewer of recording.viewers) {
         activitiesToCreate.push(
            createActivity(
               viewer,
               "livestreamRecordingView",
               futureDate,
               recording.livestreamId
            )
         )
      }
   }
}

/**
 * Create activities for livestream registration and participation
 */
function processUserLivestreamData(data: UserLivestreamData[]) {
   for (const entry of data) {
      if (entry.registered?.date) {
         activitiesToCreate.push(
            createActivity(
               entry.user.userEmail,
               "livestreamRegistration",
               entry.registered.date.toDate(),
               entry.livestreamId
            )
         )
      }

      if (entry.participated?.date) {
         activitiesToCreate.push(
            createActivity(
               entry.user.userEmail,
               "livestreamRegistration",
               entry.participated.date.toDate(),
               entry.livestreamId
            )
         )
      }
   }
}

function createActivity(
   userId: string,
   type: UserActivity["type"],
   date: Date,
   livestreamId?: string
): Create<UserActivity> {
   if (!users[userId]) {
      counter.addToCustomCount("Users Without UserData document", 1)
      return null
   }

   const user = pickPublicDataFromUser(users[userId])

   // firestore doesn't allow undefined values
   // we have some old users with missing data
   user.authId = user.authId ?? null
   user.firstName = user.firstName ?? null
   user.lastName = user.lastName ?? null

   return {
      collection: "userActivity",
      userId,
      user,
      date: Timestamp.fromDate(date),
      type,
      relatedLivestreamId: livestreamId ?? null,
   }
}

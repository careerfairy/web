import { logAction } from "../../../util/logger"
import { livestreamRepo, userRepo } from "../../../repositories"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { TalentProfile, UserData } from "@careerfairy/shared-lib/dist/users"
import { BulkWriter } from "firebase-admin/firestore"
import { firestore } from "../../../lib/firebase"
import Counter from "../../../lib/Counter"
import counterConstants from "../../../lib/Counter/constants"
import * as cliProgress from "cli-progress"
import { getCLIBarOptions } from "../../../util/misc"
import { sortLivestreamsDesc } from "@careerfairy/shared-lib/dist/utils"

const counter = new Counter()
const bar = new cliProgress.SingleBar(
   {
      hideCursor: true,
      clearOnComplete: false,
      ...getCLIBarOptions("Writing user batch", "Writes"),
   },
   cliProgress.Presets.shades_grey
)

// cached globally
let users: UserData[]
let bulkWriter: BulkWriter

/**
 * Run the migration
 * Fetches the all the users & all the livestreams
 */
export async function run() {
   bulkWriter = firestore.bulkWriter()

   // sorted asc to make sure the talent pool doc has the most recent livestream obj
   const livestreams = await logAction(
      () =>
         livestreamRepo
            .getAllLivestreams()
            .then((livestreams) => livestreams.sort(sortAsc)),
      "Fetching all livestreams"
   )

   users = await logAction(() => userRepo.getAllUsers(), "Fetching all users")

   bar.start(users.length, 0)

   await processLivestreams(livestreams)

   await bulkWriter.close()
   bar.stop()
   counter.print()
}

/**
 * Check the users in the talentPool for the livestreams
 */
const processLivestreams = async (livestreams: LivestreamEvent[]) => {
   let count = 0
   for (const livestream of livestreams) {
      if (!livestream.talentPool) continue

      for (const userEmail of livestream.talentPool) {
         addTalentProfilesToUser(userEmail, livestream)
         if (++count % 80 === 0) {
            await bulkWriter.flush()
         }
      }
   }
   await bulkWriter.flush()
}

/**
 * Insert the talentProfiles in the userData doc
 */
function addTalentProfilesToUser(
   userEmail: string,
   livestream: LivestreamEvent
) {
   const userData = users.find((u) => u.userEmail === userEmail)
   if (!userData) {
      counter.setCustomCount(
         "Livestream talentPool email without userData doc",
         1
      )
      console.error(
         "Livestream talentPool email without userData doc",
         userData
      )
      return
   }

   if (!livestream.groupIds) {
      counter.setCustomCount("Livestream groupIds field does not exist", 1)
      console.error("Livestream groupIds field does not exist", livestream.id)
      return
   }

   for (const groupId of livestream.groupIds) {
      let userRef = firestore.collection("userData").doc(userEmail)
      const groupTalentEntryRef = userRef
         .collection("talentProfiles")
         .doc(groupId)

      const data: TalentProfile = {
         id: groupId,
         groupId,
         userId: userData.authId ?? null,
         userEmail: userData.userEmail ?? null,
         user: userData ?? null,
         mostRecentLivestream: livestream ?? null,
         joinedAt: livestream.start ?? null,
      }

      bulkWriter
         .set(groupTalentEntryRef, data, { merge: true })
         .then(() => {
            counter.writeIncrement()
         })
         .catch((error) => {
            console.error("bulkWriter.set failed", error)
            counter.addToCustomCount(counterConstants.numFailedWrites, 1)
         })
         .finally(() => {
            bar.increment()
         })
   }
}

function sortAsc(a: LivestreamEvent, b: LivestreamEvent) {
   return sortLivestreamsDesc(a, b, true)
}

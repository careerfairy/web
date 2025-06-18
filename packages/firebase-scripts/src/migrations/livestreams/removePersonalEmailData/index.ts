import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import { DocumentReference } from "firebase-admin/firestore"

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { BatchManager } from "../../../util/batchUtils"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"

// Constants
const DRY_RUN = false // MODIFY THIS TO TOGGLE DRY RUN

// Global state
const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Processing livestreams", "Livestreams"),
   },
   cliProgress.Presets.shades_grey
)

export async function run() {
   const batchManager = new BatchManager(firestore, counter, DRY_RUN)

   try {
      const [allLivestreams, allDraftLivestreams] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreams<true>(false, true),
               livestreamRepo.getAllDraftLivestreams(true),
            ]),
         "Fetching all livestreams and draft livestreams"
      )

      counter.addToReadCount(allLivestreams.length + allDraftLivestreams.length)
      progressBar.start(allLivestreams.length + allDraftLivestreams.length, 0)

      for (const livestream of [...allLivestreams, ...allDraftLivestreams]) {
         progressBar.increment()

         const toUpdate: Partial<LivestreamEvent> = {
            // @ts-expect-error - email is no longer a valid field on Speaker
            speakers: livestream.speakers?.map(removeEmailCallback) || [],
            adHocSpeakers:
               // @ts-expect-error - email is no longer a valid field on Speaker
               livestream.adHocSpeakers?.map(removeEmailCallback) || [],
            liveSpeakers: [],
            author: livestream.author || {},
            lastUpdatedAuthorInfo: livestream.lastUpdatedAuthorInfo || {},
         }

         // @ts-expect-error - email is no longer a valid field on AuthorInfo
         delete toUpdate.author?.email
         // @ts-expect-error - email is no longer a valid field on AuthorInfo
         delete toUpdate.lastUpdatedAuthorInfo?.email

         await batchManager.add((batch) => {
            batch.update(
               livestream._ref as unknown as DocumentReference<LivestreamEvent>,
               toUpdate
            )
         })
      }

      await batchManager.commit()
      progressBar.stop()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

/**
 * Removes the email field from any object that might contain it
 * Used for data privacy compliance
 */
const removeEmailCallback = <T extends { email?: unknown }>(speaker: T) => {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const { email, ...speakerWithoutEmail } = speaker
   return speakerWithoutEmail
}

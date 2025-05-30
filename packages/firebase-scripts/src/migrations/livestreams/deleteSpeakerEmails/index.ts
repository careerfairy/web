import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import { DocumentReference } from "firebase-admin/firestore"

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { livestreamRepo } from "../../../repositories"
import { UltraBatch } from "../../../util/batchUtils"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { WithRef } from "../../../util/types"

// Constants
const RUNNING_VERSION = "1.0"
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

let allLivestreams: WithRef<LivestreamEvent>[]
let allDraftLivestreams: WithRef<LivestreamEvent>[]

export async function run() {
   const ultraBatch = new UltraBatch(firestore, counter, DRY_RUN)
   try {
      logMigrationStart()
      ;[allLivestreams, allDraftLivestreams] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreams<true>(false, true),
               livestreamRepo.getAllDraftLivestreams(true),
            ]),
         "Fetching all livestreams and draft livestreams"
      )

      counter.addToReadCount(allLivestreams.length + allDraftLivestreams.length)

      for (const livestream of [...allLivestreams, ...allDraftLivestreams]) {
         progressBar.increment()

         const toUpdate: Partial<LivestreamEvent> = {
            speakers: livestream.speakers?.map(removeEmailCallback) || [],
            adHocSpeakers:
               livestream.adHocSpeakers?.map(removeEmailCallback) || [],
            liveSpeakers: [],
            author: livestream.author || {},
         }

         // @ts-expect-error - email is no longer a valid field on AuthorInfo
         delete toUpdate.author?.email

         await ultraBatch.add((batch) => {
            batch.update(
               livestream._ref as unknown as DocumentReference<LivestreamEvent>,
               toUpdate
            )
         })
      }

      await ultraBatch.commit()
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

function logMigrationStart() {
   Counter.log(
      `Starting migration: Remove personal email data from livestreams - v${RUNNING_VERSION} ${
         DRY_RUN ? "(DRY RUN)" : ""
      }`
   )
}

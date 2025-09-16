import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { Creator } from "@careerfairy/shared-lib/dist/groups/creators"
import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import { DocumentReference } from "firebase-admin/firestore"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { BatchManager } from "../../../util/batchUtils"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { WithRef } from "../../../util/types"

const counter = new Counter()
const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Processing documents", "Docs"),
   },
   cliProgress.Presets.shades_grey
)

let groupsDict: Record<string, Group>
let batchManager: BatchManager

export async function run() {
   try {
      // Initialize BatchManager
      batchManager = new BatchManager(firestore, counter, false)

      // Fetch all groups, creators, livestreams and drafts
      const [
         groupsRaw,
         creatorsRaw,
         livestreamsRaw,
         draftLivestreamsRaw,
         sparksRaw,
      ] = await logAction(
         () =>
            Promise.all([
               groupRepo.getAllGroups(true),
               groupRepo.getAllCreators(true),
               livestreamRepo.getAllLivestreams<true>(false, true),
               livestreamRepo.getAllDraftLivestreams(true),
               groupRepo.getAllSparks(true),
            ]),
         "Fetching groups, creators, livestreams, draft livestreams and sparks"
      )

      const groups = groupsRaw ?? []
      const creators = creatorsRaw ?? []
      const livestreams = livestreamsRaw ?? []
      const draftLivestreams = draftLivestreamsRaw ?? []
      const sparks = sparksRaw ?? []

      groupsDict = convertDocArrayToDict(groups)

      counter.addToReadCount(
         (groups?.length ?? 0) +
            (creators?.length ?? 0) +
            (livestreams?.length ?? 0) +
            (draftLivestreams?.length ?? 0) +
            (sparks?.length ?? 0)
      )

      // Backfill creators company fields
      await backfillCreatorsCompanyFields(creators)

      // Backfill speakers on livestreams and drafts
      await backfillSpeakersCompanyFields([
         ...(livestreams || []),
         ...(draftLivestreams || []),
      ])

      // Backfill spark embedded creator
      await backfillSparksCreatorCompanyFields(sparks || [])

      // Commit any remaining batch operations
      await batchManager.commit()
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

async function backfillCreatorsCompanyFields(creators: Creator[]) {
   const targets = creators.filter((c) => needsCompanyBackfill(c))

   progressBar.start(targets.length, 0)

   for (const creator of targets) {
      const group = groupsDict[creator.groupId]
      progressBar.increment()
      if (!group) continue

      const toUpdate: Partial<Creator> = {}
      if (!creator.companyName && group.universityName) {
         toUpdate.companyName = group.universityName
      }
      if (!creator.companyLogoUrl && group.logoUrl) {
         toUpdate.companyLogoUrl = group.logoUrl
      }

      if (Object.keys(toUpdate).length === 0) continue

      const ref = firestore
         .collection("careerCenterData")
         .doc(creator.groupId)
         .collection("creators")
         .doc(creator.id)

      await batchManager.add((batch) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(ref as any, toUpdate)
      })
      counter.addToCustomCount("creatorsUpdated", 1)
   }

   progressBar.stop()
}

async function backfillSpeakersCompanyFields(
   livestreams: WithRef<LivestreamEvent>[]
) {
   const total = livestreams.length
   progressBar.start(total, 0)

   for (const stream of livestreams) {
      progressBar.increment()
      if (!stream.speakers?.length) continue

      let hasChanges = false
      const updatedSpeakers: Speaker[] = []

      for (const speaker of stream.speakers) {
         const groupId = speaker.groupId
         if (!groupId) {
            updatedSpeakers.push(speaker)
            continue
         }

         const group = groupsDict[groupId]
         if (!group) {
            updatedSpeakers.push(speaker)
            continue
         }

         const updated: Speaker = { ...speaker }
         if (!updated.companyName && group.universityName) {
            updated.companyName = group.universityName
         }
         if (!updated.companyLogoUrl && group.logoUrl) {
            updated.companyLogoUrl = group.logoUrl
         }

         if (
            updated.companyName !== speaker.companyName ||
            updated.companyLogoUrl !== speaker.companyLogoUrl
         ) {
            hasChanges = true
         }

         updatedSpeakers.push(updated)
      }

      if (!hasChanges) continue

      await batchManager.add((batch) => {
         batch.update(
            stream._ref as unknown as DocumentReference,
            {
               speakers: updatedSpeakers,
            } as Partial<LivestreamEvent>
         )
      })
      counter.addToCustomCount("livestreamSpeakersUpdated", 1)
   }

   progressBar.stop()
}

async function backfillSparksCreatorCompanyFields(
   sparks: Array<
      WithRef<{
         id: string
         creator: {
            id: string
            groupId?: string
            companyName?: string
            companyLogoUrl?: string
         }
      }>
   >
) {
   progressBar.start(sparks.length, 0)

   for (const spark of sparks) {
      progressBar.increment()
      const groupId = spark.creator?.groupId
      if (!groupId) continue
      const group = groupsDict[groupId]
      if (!group) continue

      const needsUpdate =
         (!spark.creator.companyName && group.universityName) ||
         (!spark.creator.companyLogoUrl && group.logoUrl)

      if (!needsUpdate) continue

      const toUpdate = {
         creator: {
            ...spark.creator,
            companyName:
               spark.creator.companyName || group.universityName || null,
            companyLogoUrl:
               spark.creator.companyLogoUrl || group.logoUrl || null,
         },
      }

      await batchManager.add((batch) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         batch.update(spark._ref as any, toUpdate)
      })

      counter.addToCustomCount("sparksUpdated", 1)
   }

   progressBar.stop()
}

function needsCompanyBackfill(creator: Creator) {
   return !creator.companyName || !creator.companyLogoUrl
}

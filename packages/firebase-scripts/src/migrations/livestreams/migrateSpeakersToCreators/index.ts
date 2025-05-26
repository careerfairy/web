import {
   Creator,
   CreatorRoles,
} from "@careerfairy/shared-lib/src/groups/creators"
import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/src/livestreams"
import * as cliProgress from "cli-progress"
import firebase from "firebase/compat/app"

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { WithRef } from "../../../util/types"

const RUNNING_VERSION = "1.0"
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
   try {
      Counter.log(
         `Starting migration: Deprecate speaker emails and backfill creators - v${RUNNING_VERSION}`
      )

      // Fetch all livestreams and creators
      const [allLivestreams, allCreators] = await logAction(
         () =>
            Promise.all([
               livestreamRepo.getAllLivestreams<true>(false, true),
               groupRepo.getAllCreators(false),
            ]),
         "Fetching all livestreams and creators"
      )

      Counter.log(
         `Fetched ${allLivestreams.length} livestreams and ${allCreators.length} creators`
      )

      counter.addToReadCount(allLivestreams.length + allCreators.length)

      // Create a map of creators by email and groupId for efficient lookup
      const creatorsByEmailAndGroup = new Map<string, Creator>()
      allCreators.forEach((creator) => {
         const key = `${creator.email}:${creator.groupId}`
         creatorsByEmailAndGroup.set(key, creator)
      })

      // Process livestreams in batches
      await processLivestreams(allLivestreams, creatorsByEmailAndGroup)

      // Process draft livestreams
      const allDraftLivestreams = await logAction(
         () => livestreamRepo.getAllDraftLivestreams(true),
         "Fetching all draft livestreams"
      )

      Counter.log(`Fetched ${allDraftLivestreams.length} draft livestreams`)
      counter.addToReadCount(allDraftLivestreams.length)

      await processDraftLivestreams(
         allDraftLivestreams,
         creatorsByEmailAndGroup
      )
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

async function processLivestreams(
   livestreams: WithRef<LivestreamEvent>[],
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   const batchSize = 50 // Smaller batch size due to potential creator creation
   const totalNumDocs = livestreams.length

   progressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const livestreamsChunk = livestreams.slice(i, i + batchSize)

      for (const livestream of livestreamsChunk) {
         await processLivestreamSpeakers(livestream, creatorsByEmailAndGroup)
         progressBar.increment()
      }
   }

   progressBar.stop()
   Counter.log("All livestreams processed! :)")
}

async function processDraftLivestreams(
   draftLivestreams: WithRef<LivestreamEvent>[],
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   const batchSize = 50
   const totalNumDocs = draftLivestreams.length

   progressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += batchSize) {
      const livestreamsChunk = draftLivestreams.slice(i, i + batchSize)

      for (const livestream of livestreamsChunk) {
         await processLivestreamSpeakers(livestream, creatorsByEmailAndGroup)
         progressBar.increment()
      }
   }

   progressBar.stop()
   Counter.log("All draft livestreams processed! :)")
}

async function processLivestreamSpeakers(
   livestream: WithRef<LivestreamEvent>,
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   if (!livestream.speakers || livestream.speakers.length === 0) {
      return
   }

   const updatedSpeakers: Speaker[] = []
   const updatedCreatorIds = new Set(livestream.creatorsIds || [])
   let hasChanges = false

   for (const speaker of livestream.speakers) {
      // Skip speakers that don't have an email (nothing to migrate)
      if (!speaker.email) {
         updatedSpeakers.push(speaker)
         continue
      }

      // Try to find matching creator in any of the livestream's groups
      let matchingCreator: Creator | null = null

      for (const groupId of livestream.groupIds || []) {
         const key = `${speaker.email}:${groupId}`
         if (creatorsByEmailAndGroup.has(key)) {
            matchingCreator = creatorsByEmailAndGroup.get(key)
            break
         }
      }

      if (matchingCreator) {
         // Found existing creator - update speaker to reference it
         const updatedSpeaker: Omit<Speaker, "email"> & { id: string } = {
            avatar: speaker.avatar,
            background: speaker.background,
            firstName: speaker.firstName,
            lastName: speaker.lastName,
            position: speaker.position,
            rank: speaker.rank,
            linkedInUrl: speaker.linkedInUrl,
            roles: speaker.roles,
            groupId: speaker.groupId,
            id: matchingCreator.id,
         }

         updatedSpeakers.push(updatedSpeaker as Speaker)
         updatedCreatorIds.add(matchingCreator.id)
         hasChanges = true

         counter.addToCustomCount("speakersLinkedToExistingCreators", 1)
      } else {
         // No matching creator found - create new creator
         const primaryGroupId = await selectPrimaryGroupId(livestream.groupIds)
         if (!primaryGroupId) {
            Counter.log(
               `Warning: Livestream ${livestream.id} has no groupIds, skipping speaker ${speaker.email}`
            )
            updatedSpeakers.push(speaker)
            continue
         }

         try {
            const newCreator = await createCreatorFromSpeaker(
               speaker,
               primaryGroupId
            )

            // Update the cache for future lookups
            const key = `${speaker.email}:${primaryGroupId}`
            creatorsByEmailAndGroup.set(key, newCreator)

            // Update speaker to reference new creator
            const updatedSpeaker: Omit<Speaker, "email"> & { id: string } = {
               avatar: speaker.avatar,
               background: speaker.background,
               firstName: speaker.firstName,
               lastName: speaker.lastName,
               position: speaker.position,
               rank: speaker.rank,
               linkedInUrl: speaker.linkedInUrl,
               roles: speaker.roles,
               groupId: speaker.groupId,
               id: newCreator.id,
            }

            updatedSpeakers.push(updatedSpeaker as Speaker)
            updatedCreatorIds.add(newCreator.id)
            hasChanges = true

            counter.addToCustomCount("newCreatorsCreated", 1)
            counter.writeIncrement() // For creator creation
         } catch (error) {
            Counter.log(
               `Error creating creator for speaker ${speaker.email}: ${error.message}`
            )
            updatedSpeakers.push(speaker) // Keep original speaker if creator creation fails
         }
      }
   }

   // Update livestream if there are changes
   if (hasChanges) {
      const updateData: Partial<LivestreamEvent> = {
         speakers: updatedSpeakers,
         creatorsIds: [...new Set(Array.from(updatedCreatorIds))],
      }

      await livestream._ref.update(updateData)
      counter.writeIncrement()
      counter.addToCustomCount("livestreamsUpdated", 1)
   }
}

async function createCreatorFromSpeaker(
   speaker: Speaker,
   groupId: string
): Promise<Creator> {
   const creatorRef = firestore
      .collection("careerCenterData")
      .doc(groupId)
      .collection("creators")
      .doc() // Generate new document ID

   const newCreator: Creator = {
      firstName: speaker.firstName || "Unknown",
      lastName: speaker.lastName || "Speaker",
      position: speaker.position || "Speaker",
      email: speaker.email,
      avatarUrl: speaker.avatar || "",
      linkedInUrl: speaker.linkedInUrl || "",
      story: speaker.background || "",
      roles:
         speaker.roles && speaker.roles.length > 0
            ? speaker.roles
            : [CreatorRoles.Speaker],
      id: creatorRef.id,
      groupId,
      documentType: "groupCreator",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: firebase.firestore.FieldValue.serverTimestamp() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedAt: firebase.firestore.FieldValue.serverTimestamp() as any,
   }

   await creatorRef.set(newCreator)

   return newCreator
}

async function selectPrimaryGroupId(
   groupIds: string[] | undefined
): Promise<string | null> {
   if (!groupIds || groupIds.length === 0) {
      return null
   }

   // If there's only one group, use it
   if (groupIds.length === 1) {
      return groupIds[0]
   }

   // If there are multiple groups, prioritize company groups (without universityCode) over university groups
   try {
      const groupPromises = groupIds.map((groupId) =>
         groupRepo.getGroupById(groupId)
      )
      const groups = await Promise.all(groupPromises)

      // Filter out null groups and find the first group without universityCode
      const validGroups = groups.filter((group) => group !== null)
      const companyGroup = validGroups.find((group) => !group.universityCode)

      if (companyGroup) {
         return companyGroup.id
      }

      // If all groups have universityCode, just return the first valid one
      return validGroups[0]?.id || groupIds[0]
   } catch (error) {
      Counter.log(`Error fetching groups for selection: ${error.message}`)
      // Fallback to first groupId if there's an error
      return groupIds[0]
   }
}

import {
   Creator,
   CreatorRoles,
} from "@careerfairy/shared-lib/dist/groups/creators"
import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import {
   DocumentReference,
   FieldValue,
   WriteBatch,
} from "firebase-admin/firestore"

import { convertDocArrayToDict } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { WithRef } from "../../../util/types"

// Constants
const RUNNING_VERSION = "1.1"
const DRY_RUN = false // MODIFY THIS TO TOGGLE DRY RUN
const BACKFILLED_EMAIL_DOMAIN = "careerfairy.io" // Changed from constant to domain only
const LIVESTREAMS_PER_CHUNK = 300 // How many livestreams to process in one chunk
const MAX_BATCH_OPERATIONS = 450 // Firestore's limit of operations per batch

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
let allCreators: Creator[]
let allDraftLivestreams: WithRef<LivestreamEvent>[]
let allGroupsDict: Record<string, Group>
let currentBatch: WriteBatch
let batchOperationCount = 0

export async function run() {
   try {
      logMigrationStart()

      // Initialize batch
      currentBatch = firestore.batch()

      // Fetch all data
      ;[allLivestreams, allDraftLivestreams, allGroupsDict, allCreators] =
         await logAction(
            () =>
               Promise.all([
                  livestreamRepo.getAllLivestreams<true>(false, true),
                  livestreamRepo.getAllDraftLivestreams(true),
                  groupRepo.getAllGroups(true).then(convertDocArrayToDict),
                  groupRepo.getAllCreators(false),
               ]),
            "Fetching all livestreams, draft livestreams, creators, and groups"
         )

      logDataFetched({
         numLivestreams: allLivestreams.length,
         numCreators: allCreators.length,
         numDraftLivestreams: allDraftLivestreams.length,
         numGroups: Object.keys(allGroupsDict).length,
      })

      counter.addToReadCount(
         allLivestreams.length +
            allCreators.length +
            allDraftLivestreams.length +
            Object.keys(allGroupsDict).length
      )

      // Build creator lookup maps
      const creatorsByEmailAndGroup = buildCreatorLookupMap(allCreators)

      // Process all livestreams
      await processLivestreamsInBatches(
         [...allLivestreams, ...allDraftLivestreams],
         creatorsByEmailAndGroup
      )

      // Commit any remaining batch operations
      if (batchOperationCount > 0 && !DRY_RUN) {
         await commitBatch()
         Counter.log(
            `Final batch committed with ${batchOperationCount} operations`
         )
      }
   } catch (error) {
      console.error(error)
      throwMigrationError(error.message)
   } finally {
      counter.print()
   }
}

// Helper function to manage batch operations
async function addToBatch(operation: () => void): Promise<void> {
   if (DRY_RUN) return

   // Check if we need to commit current batch first
   if (batchOperationCount >= MAX_BATCH_OPERATIONS) {
      await commitBatch()
   }

   // Add operation to batch
   operation()
   batchOperationCount++
}

// Helper function to commit the current batch and start a new one
async function commitBatch(): Promise<void> {
   if (batchOperationCount === 0) return

   await currentBatch.commit()
   counter.addToWriteCount(batchOperationCount)
   counter.addToCustomCount("batchesCommitted", 1)

   // Reset batch
   currentBatch = firestore.batch()
   batchOperationCount = 0
}

function logMigrationStart() {
   Counter.log(
      `Starting migration: Deprecate speaker emails and backfill creators - v${RUNNING_VERSION} ${
         DRY_RUN ? "(DRY RUN)" : ""
      }`
   )
}

function logDataFetched({
   numLivestreams,
   numCreators,
   numDraftLivestreams,
   numGroups,
}: {
   numLivestreams: number
   numCreators: number
   numDraftLivestreams: number
   numGroups: number
}) {
   Counter.log(
      `Fetched ${numLivestreams} livestreams, ${numCreators} creators, ${numDraftLivestreams} draft livestreams, and ${numGroups} groups`
   )
}

function buildCreatorLookupMap(creators: Creator[]): Map<string, Creator> {
   const creatorsByEmailAndGroup = new Map<string, Creator>()

   creators.forEach((creator) => {
      // Add email-based key (excluding backfilled emails)
      if (creator.email) {
         creatorsByEmailAndGroup.set(
            createEmailKey(creator.email, creator.groupId),
            creator
         )
      }

      // Add name-based key for case-insensitive matching
      if (creator.firstName && creator.lastName) {
         creatorsByEmailAndGroup.set(
            createNameKey(creator.firstName, creator.lastName, creator.groupId),
            creator
         )
      }
   })

   return creatorsByEmailAndGroup
}

async function processLivestreamsInBatches(
   livestreams: WithRef<LivestreamEvent>[],
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   const totalNumDocs = livestreams.length
   progressBar.start(totalNumDocs, 0)

   for (let i = 0; i < totalNumDocs; i += LIVESTREAMS_PER_CHUNK) {
      const livestreamsChunk = livestreams.slice(i, i + LIVESTREAMS_PER_CHUNK)

      for (const livestream of livestreamsChunk) {
         await processLivestreamSpeakers(livestream, creatorsByEmailAndGroup)
         progressBar.increment()
      }

      // Commit batch after processing each chunk to avoid memory issues
      if (batchOperationCount > 0 && !DRY_RUN) {
         await commitBatch()
      }
   }

   progressBar.stop()
   Counter.log("All livestreams processed! :)")
}

async function processLivestreamSpeakers(
   livestream: WithRef<LivestreamEvent>,
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   if (!livestream.speakers?.length) return

   const updatedSpeakers: Speaker[] = []
   const updatedCreatorIds = new Set(livestream.creatorsIds || [])

   for (const speaker of livestream.speakers) {
      const result = await processSingleSpeaker(
         speaker,
         livestream,
         creatorsByEmailAndGroup
      )

      updatedSpeakers.push(result.speaker)
      if (result.creatorId) {
         updatedCreatorIds.add(result.creatorId)
      }
   }

   await updateLivestream(livestream, updatedSpeakers, updatedCreatorIds)
}

interface SpeakerProcessResult {
   speaker: Speaker
   creatorId?: string
}

async function processSingleSpeaker(
   speaker: Speaker,
   livestream: WithRef<LivestreamEvent>,
   creatorsByEmailAndGroup: Map<string, Creator>
): Promise<SpeakerProcessResult> {
   const matchingCreator = findMatchingCreator(
      speaker,
      livestream.groupIds || [],
      creatorsByEmailAndGroup
   )

   if (matchingCreator) {
      return handleExistingCreator(speaker, matchingCreator)
   } else {
      return await handleNewCreator(
         speaker,
         livestream,
         creatorsByEmailAndGroup
      )
   }
}

function findMatchingCreator(
   speaker: Speaker,
   groupIds: string[],
   creatorsByEmailAndGroup: Map<string, Creator>
): Creator | null {
   for (const groupId of groupIds) {
      // Try email match first
      if (speaker.email) {
         const emailKey = createEmailKey(speaker.email, groupId)
         const creator = creatorsByEmailAndGroup.get(emailKey)
         if (creator) {
            counter.addToCustomCount("speakersMatchedByEmail", 1)
            return creator
         }
      }

      // Try name match
      if (speaker.firstName && speaker.lastName) {
         const nameKey = createNameKey(
            speaker.firstName,
            speaker.lastName,
            groupId
         )
         const creator = creatorsByEmailAndGroup.get(nameKey)
         if (creator) {
            counter.addToCustomCount("speakersMatchedByName", 1)
            return creator
         }
      }
   }

   return null
}

function handleExistingCreator(
   speaker: Speaker,
   matchingCreator: Creator
): SpeakerProcessResult {
   // Already correctly linked
   if (speaker.id === matchingCreator.id) {
      counter.addToCustomCount("speakersAlreadyLinkedCorrectly", 1)
      return { speaker, creatorId: matchingCreator.id }
   }

   // Link to existing creator
   counter.addToCustomCount("speakersLinkedToExistingCreators", 1)
   const updatedSpeaker = createSpeakerWithoutEmail(speaker, matchingCreator.id)
   return {
      speaker: updatedSpeaker,
      creatorId: matchingCreator.id,
   }
}

async function handleNewCreator(
   speaker: Speaker,
   livestream: WithRef<LivestreamEvent>,
   creatorsByEmailAndGroup: Map<string, Creator>
): Promise<SpeakerProcessResult> {
   const primaryGroupId = selectPrimaryGroupId(livestream.groupIds)

   if (!primaryGroupId) {
      // No groupId, skip
      return { speaker }
   }

   if (DRY_RUN) {
      counter.addToCustomCount("newCreatorsWouldBeCreated", 1)
      const dryRunSpeaker = createSpeakerWithoutEmail(
         speaker,
         "DRY_RUN_NEW_CREATOR_ID"
      )
      return { speaker: dryRunSpeaker }
   }

   try {
      const newCreator = await createCreatorFromSpeaker(speaker, primaryGroupId)
      updateCreatorCache(newCreator, creatorsByEmailAndGroup)

      console.log("🚀 ~ newCreator:", JSON.stringify(newCreator, null, 2))
      counter.addToCustomCount("newCreatorsCreated", 1)

      const updatedSpeaker = createSpeakerWithoutEmail(speaker, newCreator.id)
      return {
         speaker: updatedSpeaker,
         creatorId: newCreator.id,
      }
   } catch (error) {
      Counter.log(
         `Error creating creator for speaker ${speaker.email}: ${error.message}`
      )
      return { speaker }
   }
}

function createSpeakerWithoutEmail(
   speaker: Speaker,
   creatorId: string
): Omit<Speaker, "email"> & { id: string } {
   return {
      avatar: speaker.avatar || "",
      background: speaker.background || "",
      firstName: speaker.firstName || "",
      lastName: speaker.lastName || "",
      position: speaker.position || "",
      rank: speaker.rank || 0,
      linkedInUrl: speaker.linkedInUrl || "",
      roles: speaker.roles || [],
      groupId: speaker.groupId,
      id: creatorId,
   }
}

function updateCreatorCache(
   creator: Creator,
   creatorsByEmailAndGroup: Map<string, Creator>
) {
   // Update cache for future lookups
   if (creator.email) {
      creatorsByEmailAndGroup.set(
         createEmailKey(creator.email, creator.groupId),
         creator
      )
   }

   if (creator.firstName && creator.lastName) {
      creatorsByEmailAndGroup.set(
         createNameKey(creator.firstName, creator.lastName, creator.groupId),
         creator
      )
   }
}

async function updateLivestream(
   livestream: WithRef<LivestreamEvent>,
   updatedSpeakers: Speaker[],
   updatedCreatorIds: Set<string>
) {
   if (DRY_RUN) {
      counter.addToCustomCount("livestreamsWouldBeUpdated", 1)
      return
   }

   const updateData: Partial<LivestreamEvent> = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      speakers: updatedSpeakers.map(({ email, ...rest }) => rest),
      creatorsIds: Array.from(updatedCreatorIds),
   }

   await addToBatch(() => {
      currentBatch.update(
         livestream._ref as unknown as DocumentReference,
         updateData
      )
   })

   counter.addToCustomCount("livestreamsUpdated", 1)
}

async function createCreatorFromSpeaker(
   speaker: Speaker,
   groupId: string
): Promise<Creator> {
   const creatorRef = firestore
      .collection("careerCenterData")
      .doc(groupId)
      .collection("creators")
      .doc()

   const email = speaker.email || generateBackfilledEmail(speaker, groupId)
   if (!speaker.email) {
      counter.addToCustomCount("speakersWithBackfilledEmails", 1)
   }

   const timestamp = FieldValue.serverTimestamp()
   const newCreator: Creator = {
      firstName: speaker.firstName || "Unknown",
      lastName: speaker.lastName || "Speaker",
      position: speaker.position || "Speaker",
      email,
      avatarUrl: speaker.avatar || "",
      linkedInUrl: speaker.linkedInUrl || "",
      story: speaker.background || "",
      roles: speaker.roles?.length ? speaker.roles : [CreatorRoles.Speaker],
      id: creatorRef.id,
      groupId,
      documentType: "groupCreator",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: timestamp as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedAt: timestamp as any,
   }

   await addToBatch(() => {
      currentBatch.set(creatorRef, newCreator)
   })

   return newCreator
}

const selectPrimaryGroupId = (
   groupIds: string[] | undefined
): string | null => {
   if (!groupIds?.length) return null
   if (groupIds.length === 1) return groupIds[0]

   try {
      const validGroups = groupIds
         .map((groupId) => allGroupsDict[groupId])
         .filter(Boolean)

      // Prioritize company groups (without universityCode)
      const companyGroup = validGroups.find((group) => !group.universityCode)
      return companyGroup?.id || validGroups[0]?.id || groupIds[0]
   } catch (error) {
      Counter.log(`Error fetching groups for selection: ${error.message}`)
      return groupIds[0]
   }
}

// Helper functions
function createNameKey(
   firstName: string,
   lastName: string,
   groupId: string
): string {
   return `${firstName.trim().toLowerCase()}:${lastName
      .trim()
      .toLowerCase()}:${groupId}`.replace(/\s+/g, "-")
}

function createEmailKey(email: string, groupId: string): string {
   return `${email}:${groupId}`
}

// Add new function to generate unique backfilled emails
function generateBackfilledEmail(speaker: Speaker, groupId: string): string {
   const firstName = (speaker.firstName || "unknown").trim().toLowerCase()
   const lastName = (speaker.lastName || "speaker").trim().toLowerCase()
   const namePart = `${firstName}_${lastName}`.replace(/\s+/g, "-")

   return `backfill+${namePart}_${groupId}@${BACKFILLED_EMAIL_DOMAIN}` // e.g. backfill+john_doe_groupId@careerfairy.io
}

import {
   Creator,
   CreatorRoles,
} from "@careerfairy/shared-lib/dist/groups/creators"
import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/dist/livestreams"
import * as cliProgress from "cli-progress"
import { FieldValue } from "firebase-admin/firestore"

import Counter from "../../../lib/Counter"
import { firestore } from "../../../lib/firebase"
import { groupRepo, livestreamRepo } from "../../../repositories"
import { logAction } from "../../../util/logger"
import { getCLIBarOptions, throwMigrationError } from "../../../util/misc"
import { WithRef } from "../../../util/types"

const RUNNING_VERSION = "1.1"

// --- CONFIGURATION ---
// Set to true to run in dry-run mode (no actual writes to Firestore)
// Set to false to run the full migration with writes
const DRY_RUN = false // MODIFY THIS TO TOGGLE DRY RUN
// --- END CONFIGURATION ---

const counter = new Counter()

const progressBar = new cliProgress.SingleBar(
   {
      clearOnComplete: false,
      hideCursor: true,
      ...getCLIBarOptions("Processing livestreams", "Livestreams"),
   },
   cliProgress.Presets.shades_grey
)

// Track inconsistent speakers for logging at the end
interface InconsistentSpeaker {
   livestreamId: string
   speakerEmail: string
   speakerId: string
   matchingCreatorId: string
   groupId: string
}

const inconsistentSpeakers: InconsistentSpeaker[] = []

export async function run() {
   try {
      Counter.log(
         `Starting migration: Deprecate speaker emails and backfill creators - v${RUNNING_VERSION} ${
            DRY_RUN ? "(DRY RUN)" : ""
         }`
      )

      // Fetch all livestreams and creators
      const [
         allLivestreams,
         // livestream,
         allCreators,
      ] = await logAction(
         () =>
            Promise.all([
               // livestreamRepo.getById("QSOwuyePu24gjq6J3t0e"),
               livestreamRepo.getAllLivestreams<true>(false, true),
               groupRepo.getAllCreators(false),
            ]),
         "Fetching all livestreams and creators"
      )

      // // @ts-ignore
      // livestream._ref = firestore.collection("livestreams").doc(livestream.id)

      // const allLivestreams: WithRef<LivestreamEvent>[] = [
      //    livestream as WithRef<LivestreamEvent>,
      // ]

      Counter.log(
         `Fetched ${allLivestreams.length} livestreams and ${allCreators.length} creators`
      )

      counter.addToReadCount(allLivestreams.length + allCreators.length)

      // Create a map of creators by email and groupId for efficient lookup
      const creatorsByEmailAndGroup = new Map<string, Creator>()
      allCreators.forEach((creator) => {
         // Create email-based key - only if not a backfilled email
         if (creator.email && !isBackfilledEmail(creator.email)) {
            creatorsByEmailAndGroup.set(
               createEmailKey(creator.email, creator.groupId),
               creator
            )
         }

         // Create name-based key (lowercase for case-insensitive matching)
         if (creator.firstName && creator.lastName) {
            creatorsByEmailAndGroup.set(
               createNameKey(
                  creator.firstName,
                  creator.lastName,
                  creator.groupId
               ),
               creator
            )
         }
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

      // Log all inconsistent speakers at the end
      if (inconsistentSpeakers.length > 0) {
         Counter.log("\n=== INCONSISTENT SPEAKERS FOUND ===")
         Counter.log(
            `Found ${inconsistentSpeakers.length} speakers with email/ID mismatches:`
         )

         inconsistentSpeakers.forEach((speaker, index) => {
            Counter.log(
               `${index + 1}. Livestream: ${speaker.livestreamId} | Email: ${
                  speaker.speakerEmail
               } | Speaker ID: ${speaker.speakerId} | Matching Creator ID: ${
                  speaker.matchingCreatorId
               } | Group: ${speaker.groupId}`
            )
         })

         Counter.log("=== END INCONSISTENT SPEAKERS ===\n")
      } else {
         Counter.log("✅ No inconsistent speakers found!")
      }

      // Log statistics about backfilled emails
      const backfilledCount =
         counter.getCustomCount("speakersWithBackfilledEmails") || 0
      if (backfilledCount > 0) {
         Counter.log(`\n=== BACKFILLED EMAILS STATISTICS ===`)
         Counter.log(
            `Created ${backfilledCount} backfilled emails for speakers without emails`
         )
         Counter.log(
            `Format: backfilled.firstname.lastname.creatorId@speaker.careerfairy.io`
         )
         Counter.log(`=== END BACKFILLED EMAILS STATISTICS ===\n`)
      }

      // Log match statistics
      const emailMatches = counter.getCustomCount("speakersMatchedByEmail") || 0
      const nameMatches = counter.getCustomCount("speakersMatchedByName") || 0
      const alreadyLinkedCorrectly =
         counter.getCustomCount("speakersAlreadyLinkedCorrectly") || 0
      Counter.log(`\n=== MATCHING STATISTICS ===`)
      Counter.log(`Speakers matched by email: ${emailMatches}`)
      Counter.log(`Speakers matched by name: ${nameMatches}`)
      Counter.log(
         `Speakers already correctly linked: ${alreadyLinkedCorrectly}`
      )
      Counter.log(`=== END MATCHING STATISTICS ===\n`)
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
      // Try to find matching creator in any of the livestream's groups
      let matchingCreator: Creator | null = null

      for (const groupId of livestream.groupIds || []) {
         // Try matching by email first (if it's not a backfilled email)
         if (speaker.email && !isBackfilledEmail(speaker.email)) {
            const emailKey = createEmailKey(speaker.email, groupId)
            if (creatorsByEmailAndGroup.has(emailKey)) {
               matchingCreator = creatorsByEmailAndGroup.get(emailKey)
               counter.addToCustomCount("speakersMatchedByEmail", 1)
               break
            }
         }

         // If no match by email, try matching by first and last name
         if (!matchingCreator && speaker.firstName && speaker.lastName) {
            const nameKey = createNameKey(
               speaker.firstName,
               speaker.lastName,
               groupId
            )
            if (creatorsByEmailAndGroup.has(nameKey)) {
               matchingCreator = creatorsByEmailAndGroup.get(nameKey)
               counter.addToCustomCount("speakersMatchedByName", 1)
               break
            }
         }
      }

      if (matchingCreator) {
         // Check if speaker already has a different ID than the matching creator
         if (speaker.id && speaker.id !== matchingCreator.id) {
            counter.addToCustomCount("speakersWithMismatchedIds", 1)

            // Collect inconsistent speaker for end-of-script logging
            inconsistentSpeakers.push({
               livestreamId: livestream.id,
               speakerEmail: speaker.email,
               speakerId: speaker.id,
               matchingCreatorId: matchingCreator.id,
               groupId: matchingCreator.groupId,
            })
         }

         // Skip updating if speaker already has the correct creator ID
         if (speaker.id === matchingCreator.id) {
            counter.addToCustomCount("speakersAlreadyLinkedCorrectly", 1)
            updatedSpeakers.push(speaker)
            updatedCreatorIds.add(matchingCreator.id)
            continue
         }

         // Found existing creator - update speaker to reference it
         const updatedSpeaker: Omit<Speaker, "email"> & { id: string } = {
            avatar: speaker.avatar || "",
            background: speaker.background || "",
            firstName: speaker.firstName || "",
            lastName: speaker.lastName || "",
            position: speaker.position || "",
            rank: speaker.rank || 0,
            linkedInUrl: speaker.linkedInUrl || "",
            roles: speaker.roles || [],
            groupId: speaker.groupId,
            id: matchingCreator.id,
         }

         updatedSpeakers.push(updatedSpeaker)
         updatedCreatorIds.add(matchingCreator.id)
         hasChanges = true

         counter.addToCustomCount("speakersLinkedToExistingCreators", 1)
      } else {
         // No matching creator found - create new creator
         const primaryGroupId = await selectPrimaryGroupId(livestream.groupIds)
         if (!primaryGroupId) {
            Counter.log(
               `Warning: Livestream ${livestream.id} has no groupIds, skipping speaker ${speaker.firstName} ${speaker.lastName}`
            )
            updatedSpeakers.push(speaker)
            continue
         }
         if (!DRY_RUN) {
            try {
               const newCreator = await createCreatorFromSpeaker(
                  speaker,
                  primaryGroupId
               )

               // Update the cache for future lookups - only for non-backfilled emails
               if (newCreator.email && !isBackfilledEmail(newCreator.email)) {
                  creatorsByEmailAndGroup.set(
                     createEmailKey(newCreator.email, primaryGroupId),
                     newCreator
                  )
               }

               if (newCreator.firstName && newCreator.lastName) {
                  creatorsByEmailAndGroup.set(
                     createNameKey(
                        newCreator.firstName,
                        newCreator.lastName,
                        primaryGroupId
                     ),
                     newCreator
                  )
               }

               // Update speaker to reference new creator
               const updatedSpeaker: Omit<Speaker, "email"> & { id: string } = {
                  avatar: speaker.avatar || "",
                  background: speaker.background || "",
                  firstName: speaker.firstName || "",
                  lastName: speaker.lastName || "",
                  position: speaker.position || "",
                  rank: speaker.rank || 0,
                  linkedInUrl: speaker.linkedInUrl || "",
                  roles: speaker.roles || [],
                  groupId: speaker.groupId,
                  id: newCreator.id,
               }

               updatedSpeakers.push(updatedSpeaker)
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
         } else {
            // Dry run: just count what would be created
            counter.addToCustomCount("newCreatorsWouldBeCreated", 1)
            // In dry run, if we would create a creator, we still need to represent the speaker as "changed" for the update count
            // but keep the original speaker data for the array as no actual change is made to the object structure itself.
            const wouldBeUpdatedSpeaker: Speaker = {
               avatar: speaker.avatar || "",
               background: speaker.background || "",
               firstName: speaker.firstName || "",
               lastName: speaker.lastName || "",
               position: speaker.position || "",
               rank: speaker.rank || 0,
               linkedInUrl: speaker.linkedInUrl || "",
               roles: speaker.roles || [],
               groupId: speaker.groupId,
               id: "DRY_RUN_NEW_CREATOR_ID", // Placeholder ID for dry run
            }
            updatedSpeakers.push(wouldBeUpdatedSpeaker)
            hasChanges = true // Mark as changed to count for "livestreamsWouldBeUpdated"
         }
      }
   }

   // Update livestream if there are changes
   if (hasChanges && !DRY_RUN) {
      const updateData: Partial<LivestreamEvent> = {
         speakers: updatedSpeakers,
         creatorsIds: [...new Set(Array.from(updatedCreatorIds))],
      }

      await livestream._ref.update(updateData)
      counter.writeIncrement()
      counter.addToCustomCount("livestreamsUpdated", 1)
   } else if (hasChanges && DRY_RUN) {
      counter.addToCustomCount("livestreamsWouldBeUpdated", 1)
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

   // Create a backfilled email if speaker has no email
   const hasNoEmail = !speaker.email
   const email =
      speaker.email ||
      createBackfilledEmail(
         speaker.firstName || "Unknown",
         speaker.lastName || "Speaker",
         creatorRef.id
      )

   if (hasNoEmail) {
      counter.addToCustomCount("speakersWithBackfilledEmails", 1)
   }

   // Create the Creator object with server timestamps
   // Use FieldValue.serverTimestamp() for setting in Firestore, but cast for the return type
   const timestamp = FieldValue.serverTimestamp()

   const newCreator: Creator = {
      firstName: speaker.firstName || "Unknown",
      lastName: speaker.lastName || "Speaker",
      position: speaker.position || "Speaker",
      email: email,
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
      createdAt: timestamp as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updatedAt: timestamp as any,
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
      const validGroups = groups.filter(Boolean)
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

// Helper function to create a name-based key
function createNameKey(
   firstName: string,
   lastName: string,
   groupId: string
): string {
   return `${firstName.trim().toLowerCase()}:${lastName
      .trim()
      .toLowerCase()}:${groupId}`
}

// Helper function to create an email-based key
function createEmailKey(email: string, groupId: string): string {
   return `${email}:${groupId}`
}

// Helper function to create a backfilled email
function createBackfilledEmail(
   firstName: string,
   lastName: string,
   creatorId: string
): string {
   // Use the same firstName/lastName normalization as in createNameKey
   const normalizedFirstName = firstName.trim().toLowerCase()
   const normalizedLastName = lastName.trim().toLowerCase()
   return `backfilled.${normalizedFirstName}.${normalizedLastName}.${creatorId}@speaker.careerfairy.io`
}

// Helper function to check if an email is a backfilled email
function isBackfilledEmail(email: string): boolean {
   return (
      email.startsWith("backfilled.") &&
      email.endsWith("@speaker.careerfairy.io")
   )
}

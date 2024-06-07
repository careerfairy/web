import { createCompatGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   GroupAdmin,
   GroupAdminNewEventEmailInfo,
} from "@careerfairy/shared-lib/groups"
import {
   EventRating,
   EventRatingAnswer,
   LivestreamChatEntry,
   LivestreamEvent,
   LivestreamQueryOptions,
   UserLivestreamData,
   getEarliestEventBufferTime,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import {
   PopularityEventData,
   getPopularityPoints,
} from "@careerfairy/shared-lib/livestreams/popularity"
import {
   calculateNewAverage,
   normalizeRating,
} from "@careerfairy/shared-lib/livestreams/ratings"
import {
   LiveStreamStats,
   createLiveStreamStatsDoc,
} from "@careerfairy/shared-lib/livestreams/stats"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import {
   chunkArray,
   getArrayDifference,
   removeDuplicates,
} from "@careerfairy/shared-lib/utils"
import type { Change } from "firebase-functions"
import * as functions from "firebase-functions"
import _, { isEmpty } from "lodash"
import { DateTime } from "luxon"
import {
   DocumentSnapshot,
   FieldValue,
   Timestamp,
   firestore as firestoreAdmin,
} from "../api/firestoreAdmin"
import { FunctionsLogger, getChangeTypes } from "../util"
import { addOperations } from "./stats/livestream"
import type { OperationsToMake } from "./stats/util"
import { logAndThrow } from "./validations"

export interface ILivestreamFunctionsRepository extends ILivestreamRepository {
   /**
    * Retrieves a single chat entry from a specific livestream.
    *
    * @param livestreamId - The ID of the livestream.
    * @param entryId - The ID of the chat entry to retrieve.
    * @returns A promise that resolves to the requested LivestreamChatEntry.
    */
   getLivestreamChatEntry(
      livestreamId: string,
      entryId: string
   ): Promise<LivestreamChatEntry>

   /**
    * Deletes all chat entries from a specific livestream.
    *
    * @param livestreamId - The ID of the livestream from which the chat entries will be deleted.
    * @returns A promise that resolves when all chat entries have been successfully deleted.
    */
   deleteAllLivestreamChatEntries(livestreamId: string): Promise<void>
   /**
    * Deletes a chat entry from a specific livestream.
    *
    * @param livestreamId - The ID of the livestream from which the chat entry will be deleted.
    * @param entryId - The ID of the chat entry to be deleted.
    * @returns A promise that resolves when the chat entry has been successfully deleted.
    */
   deleteLivestreamChatEntry(
      livestreamId: string,
      entryId: string
   ): Promise<void>
   /**
    * Get all registered users for the given livestream ids
    * @param livestreamIds
    */
   getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]>

   /**
    * Get all the Non Attendees users for a specific livestream
    * @param livestreamId
    */
   getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]>

   getYesterdayLivestreams(): Promise<LivestreamEvent[]>

   /**
    * Checks if there are more than 'n' livestream events scheduled for the next 'days' days.
    *
    * @param {number} n - The number of livestreams to check for.
    * @param {number} days - The number of days into the future to check for upcoming livestreams.
    * @returns {Promise<boolean>} A promise that resolves to true if there are more than 'n' livestreams
    *                            scheduled for the next 'days' days, otherwise false.
    */
   hasMoreThanNLivestreamsInNextNDays(n: number, days: number): Promise<boolean>

   syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void>

   /*
    * The `updateLiveStreamStats` function listens for changes in the `userLivestreamData` subcollection of the `livestreams` collection,
    * and updates a `stats` subcollection document named `livestreamStats`.
    *
    * The function uses the `change.before.data()` and `change.after.data()`
    * to get the old and new data of the modified document respectively. It uses `addOperations()` function to check which fields of the newData and
    * oldData are different and updates the livestreamStatsToUpdate accordingly.
    *
    * The function also checks if the university code has been changed, if it has, the function decrements the old university data and increments the new university data.
    * In the end, it checks if there are any updates to livestreamStats, if there are updates, it performs a Firestore transaction to update livestreamStats and logs a message to indicate the
    * livestreamStats have been updated.
    * */
   addOperationsToLiveStreamStats(
      change: Change<DocumentSnapshot>,
      livestreamId: string,
      logger: FunctionsLogger
   ): Promise<void>

   /**
    * Update the livestream popularity field when a popularity event is created/deleted
    */
   updateLivestreamPopularity(
      popularityDoc: PopularityEventData,
      deleted?: boolean
   ): Promise<void>

   syncLiveStreamStatsNewRating(
      livestreamId: string,
      ratingName: string,
      newRating: EventRatingAnswer
   ): Promise<void>

   fetchLivestreams(options: LivestreamQueryOptions): Promise<LivestreamEvent[]>

   /**
    * Retrieves all the admin information for a given livestream.
    * Iterates over the array of group IDs associated with the livestream, fetches the group data and admin data from Firestore,
    * and constructs an array of GroupAdminInfo objects.
    *
    * @param streamId - The ID of the livestream.
    * @param origin - The base URL used to construct the event dashboard and next livestream links.
    * @returns  A promise that resolves to an array of GroupAdminInfo objects.
    * Each object contains the groupId, admin's email, event dashboard link, and next livestream link.
    */
   getAllGroupAdminInfoByStream(
      streamId: string,
      origin: string
   ): Promise<GroupAdminNewEventEmailInfo[]>

   /**
    * Notifies registered users of a starting livestream.
    * Iterates over the array of registered users associated with the livestream, creates a new UserNotification object for each,
    * and inserts it in the database.
    *
    * @param {LivestreamEvent} livestream
    * @returns {Promise<void>}
    */
   createLivestreamStartUserNotifications(
      livestream: LivestreamEvent
   ): Promise<void>

   /**
    * Update the hand raise state for a user in a live stream
    * @param livestreamId - The ID of the live stream.
    * @param handRaise - The new hand raise state.
    */
   updateHandRaise(livestreamId: string, handRaise: boolean): Promise<void>

   /**
    * Synchronizes the provided tag ids list @param tags, to the given live streams in @param livestreamIds.
    * @param livestreamIds ID list of live streams which the tags will be associated to to.
    * @param tags ID list of tags to associate to the live streams.
    */
   syncCustomJobBusinessFunctionTagsToLivestreams(
      afterJob: CustomJob,
      beforeJob: CustomJob,
      changeType: ReturnType<typeof getChangeTypes>
   ): Promise<void>

   /**
    * TODO: add doc
    * @param beforeJob
    */
   syncDeleteCustomJobBusinessFunctionTagsToLivestreams(
      beforeJob: CustomJob
   ): Promise<void>
}

export class LivestreamFunctionsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamFunctionsRepository
{
   async syncLiveStreamStatsNewRating(
      livestreamId: string,
      ratingName: string,
      newRating: EventRatingAnswer
   ): Promise<void> {
      const parentRatingDoc = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(ratingName)
         .get()

      if (!parentRatingDoc.exists) {
         console.error(
            "Parent rating document not found",
            livestreamId,
            ratingName,
            newRating
         )
         return
      }

      const ratingDoc = parentRatingDoc.data() as EventRating

      // also update the livestream aggregated rating
      const normalizedRating = normalizeRating(ratingDoc, newRating)

      if (normalizedRating && normalizedRating >= 1 && normalizedRating <= 5) {
         await this.updateLiveStreamStats(livestreamId, (existingStats) => {
            const existingNumOfRatings =
               existingStats?.ratings?.[ratingName]?.numberOfRatings ?? 0

            const newAvg = calculateNewAverage(
               existingStats,
               ratingName,
               normalizedRating
            )

            // will use firestore.update() behind the scenes
            const toUpdate = {}
            toUpdate[`ratings.${ratingName}.averageRating`] = newAvg
            toUpdate[`ratings.${ratingName}.numberOfRatings`] =
               existingNumOfRatings + 1

            return toUpdate
         })
      }
   }

   updateLivestreamPopularity(
      popularityDoc: PopularityEventData,
      deleted = false
   ): Promise<void> {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(popularityDoc.livestreamId)

      let points = getPopularityPoints(popularityDoc)

      if (deleted) {
         // negative to decrease
         points *= -1
      }

      functions.logger.info(
         `Increasing livestream popularity by ${points} points.`
      )

      return livestreamRef.update({
         popularity: FieldValue.increment(points),
      })
   }

   async getRegisteredUsersMultipleEvents(
      livestreamIds: string[]
   ): Promise<UserLivestreamData[]> {
      const promises: Promise<UserLivestreamData[]>[] = []

      for (const livestreamId of livestreamIds) {
         promises.push(this.getLivestreamUsers(livestreamId, "registered"))
      }

      const promiseResults = await Promise.allSettled(promises)

      // map the promises responses into a single array
      return (
         promiseResults
            .map((result) => {
               if (result.status === "fulfilled") {
                  return result.value
               } else {
                  console.warn(
                     "Failed to get the UserLivestreamData promise",
                     result.reason
                  )
                  // best effort, ignore the failed ones for now
                  return null
               }
            })
            // remove nulls
            .filter((user) => user)
            .flatMap((array) => array)
      )
   }

   async getNonAttendees(livestreamId: string): Promise<UserLivestreamData[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "==", livestreamId)
         .where("registered", "!=", null)
         .where("participated", "==", null)
         .get()

      if (!querySnapshot.empty) {
         return querySnapshot.docs?.map(
            (doc) => doc.data() as UserLivestreamData
         )
      }

      return []
   }

   async getYesterdayLivestreams(): Promise<LivestreamEvent[]> {
      const yesterdayStartOfTheDay = new Date()
      yesterdayStartOfTheDay.setDate(yesterdayStartOfTheDay.getDate() - 1)
      yesterdayStartOfTheDay.setHours(0, 0, 0)

      const todayStartOfDay = new Date()
      todayStartOfDay.getDate()
      todayStartOfDay.setHours(0, 0, 0)

      const querySnapshot = await this.firestore
         .collection("livestreams")
         .where("start", ">", yesterdayStartOfTheDay)
         .where("start", "<", todayStartOfDay)
         .get()

      if (!querySnapshot.empty) {
         return querySnapshot.docs?.map((doc) => doc.data() as LivestreamEvent)
      }

      return []
   }

   async hasMoreThanNLivestreamsInNextNDays(
      n: number,
      days: number
   ): Promise<boolean> {
      const now = DateTime.now()
      const futureDate = now.plus({ days })

      const querySnapshot = await this.firestore
         .collection("livestreams")
         .where("start", ">", now.toJSDate())
         .where("start", "<", futureDate.toJSDate())
         .limit(n + 1) // we only need to know if there are more than n, so limit to n+1
         .get()

      return querySnapshot.size > n
   }

   async syncLiveStreamStatsWithLivestream(
      snapshotChange: Change<DocumentSnapshot>
   ): Promise<void> {
      const latestLivestreamDoc = snapshotChange.after

      const statsRef = this.firestore
         .collection("livestreams")
         .doc(latestLivestreamDoc.id)
         .collection("stats")
         .doc("livestreamStats")

      if (!latestLivestreamDoc.exists) {
         // Livestream was deleted, delete the stats document
         return statsRef.delete()
      }

      const statsSnap = await statsRef.get()

      const livestream = this.addIdToDoc<LivestreamEvent>(
         latestLivestreamDoc as any
      )

      if (!statsSnap.exists) {
         // Create the stats document
         const statsDoc = createLiveStreamStatsDoc(livestream, statsRef.id)
         return statsRef.set(statsDoc)
      } else {
         const toUpdate: Pick<LiveStreamStats, "livestream"> = {
            livestream: pickPublicDataFromLivestream(livestream),
         }

         return statsRef.update(toUpdate)
      }
   }

   async addOperationsToLiveStreamStats(
      change: Change<DocumentSnapshot>,
      livestreamId: string,
      logger: FunctionsLogger
   ): Promise<void> {
      const oldUserLivestreamData = change.before.data() as UserLivestreamData
      const newUserLivestreamData = change.after.data() as UserLivestreamData

      const livestreamStatsDocOperationsToMake: OperationsToMake = {} // An empty object to store the update operations for the firestore UPDATE operation

      // Add operations for the general stats
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         livestreamStatsDocOperationsToMake
      )

      // Check if there are any updates to livestreamStats
      if (isEmpty(livestreamStatsDocOperationsToMake)) {
         logger.info("No changes to livestream stats", {
            livestreamId,
            liveStreamStatsToUpdate: livestreamStatsDocOperationsToMake,
         })
      } else {
         // Update livestreamStats
         await this.updateLiveStreamStats<OperationsToMake>(
            livestreamId,
            () => livestreamStatsDocOperationsToMake
         )

         logger.info("Updated livestream stats with the following operations", {
            livestreamId,
            livestreamStatsDocOperationsToMake,
         })
      }
   }

   async fetchLivestreams(
      options: LivestreamQueryOptions
   ): Promise<LivestreamEvent[]> {
      let q = this.firestore
         .collection("livestreams")
         .withConverter(
            createCompatGenericConverter<LivestreamEvent>()
         ) as unknown as FirebaseFirestore.Query<LivestreamEvent>

      const now = new Date()

      const {
         type,
         languageCodes,
         targetGroupId,
         withHidden,
         withRecordings,
         withTest,
      } = options

      if (targetGroupId) {
         q = q.where("groupIds", "array-contains", targetGroupId)
      } else {
         if (type === "pastEvents") {
            q = q
               .where("start", "<", now)
               .where(
                  "start",
                  ">",
                  DateTime.local().minus({ months: 8 }).toJSDate()
               )
               .orderBy("start", "desc")
         } else {
            q = q
               .where("start", ">", getEarliestEventBufferTime())
               .where("hasEnded", "==", false)
               .orderBy("start", "asc")
         }

         if (withRecordings) {
            q = q.where("denyRecordingAccess", "==", false)
         }

         if (!withTest) {
            q = q.where("test", "==", false)
         }

         if (!withHidden) {
            q = q.where("hidden", "==", false)
         }

         if (languageCodes?.length > 0) {
            q = q.where("language.code", "in", languageCodes)
         }
      }

      const snaps = await q.get()
      return snaps.docs.map((d) => d.data())
   }

   async getAllGroupAdminInfoByStream(
      streamId: string,
      origin = "https://www.careerfairy.io"
   ): Promise<GroupAdminNewEventEmailInfo[]> {
      const admins: GroupAdminNewEventEmailInfo[] = []

      const stream = await this.getById(streamId)

      if (!stream) {
         return admins
      }

      const groupIds = stream.groupIds

      for (const groupId of groupIds) {
         const groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)

         const groupSnap = await groupRef.get()

         if (!groupSnap.exists) {
            continue
         }

         const adminsSnap = await groupRef
            .collection("groupAdmins")
            .withConverter(createCompatGenericConverter<GroupAdmin>())
            .get()

         adminsSnap.docs.forEach((adminSnap) => {
            const adminData = adminSnap.data()
            admins.push({
               groupId,
               email: adminData.email,
               eventDashboardLink: `${origin}/group/${groupId}/admin/events?eventId=${streamId}`,
               nextLivestreamsLink: `${origin}/next-livestreams/group/${groupId}/livestream/${streamId}`,
            })
         })
      }

      return admins
   }

   async createLivestreamStartUserNotifications(
      livestream: LivestreamEvent
   ): Promise<void> {
      functions.logger.log(
         `Started creating livestream start notifications for livestream ${livestream.id}`
      )

      const bulkWriter = firestoreAdmin.bulkWriter()

      livestream.registeredUsers?.forEach((user) => {
         const ref = firestoreAdmin
            .collection("userData")
            .doc(user)
            .collection("userNotifications")
            .doc()

         const newNotification: UserNotification = {
            documentType: "userNotification",
            actionUrl: `/portal/livestream/${livestream.id}`,
            companyId: livestream.groupIds[0],
            livestreamId: livestream.id,
            imageFormat: "circular",
            imageUrl: livestream.companyLogoUrl,
            message: `<strong>${livestream.title}</strong> is starting now: Join before it ends!`,
            createdAt: Timestamp.now(),
            id: ref.id,
         }

         bulkWriter.set(ref, newNotification, { merge: true }).catch((err) => {
            functions.logger.log("Failed to add new notification with: ", err)
         })
      })

      functions.logger.log(
         `Notified ${livestream.registeredUsers?.length} users of livestream start`
      )

      return void bulkWriter.close()
   }

   async deleteLivestreamChatEntry(
      livestreamId: string,
      entryId: string
   ): Promise<void> {
      const chatEntryRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("chatEntries")
         .doc(entryId)

      return chatEntryRef.delete()
   }

   async deleteAllLivestreamChatEntries(livestreamId: string): Promise<void> {
      const chatEntriesRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("chatEntries")
         .withConverter(createCompatGenericConverter<LivestreamChatEntry>())

      const snapshot = await chatEntriesRef.get()

      const chunks = chunkArray(snapshot.docs, 450)

      const promises = chunks.map(async (chunk) => {
         const batch = this.firestore.batch()

         chunk.forEach((doc) => {
            batch.delete(doc.ref)
         })

         return batch.commit()
      })

      await Promise.allSettled(promises)
   }

   async getLivestreamChatEntry(
      livestreamId: string,
      entryId: string
   ): Promise<LivestreamChatEntry | null> {
      const chatEntryRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("chatEntries")
         .doc(entryId)
         .withConverter(createCompatGenericConverter<LivestreamChatEntry>())

      const snap = await chatEntryRef.get()

      if (!snap.exists) {
         return null
      }

      return snap.data()
   }

   async updateHandRaise(
      livestreamId: string,
      handRaise: boolean
   ): Promise<void> {
      const batch = this.firestore.batch()

      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .withConverter(createCompatGenericConverter<LivestreamEvent>())

      if (handRaise === false) {
         // Un-request all current hand raise requests
         const handRaiseRequestsRef = livestreamRef
            .collection("handRaises")
            .withConverter(createCompatGenericConverter<HandRaise>())
         const handRaiseRequestsSnap = await handRaiseRequestsRef.get()

         handRaiseRequestsSnap.docs.forEach((doc) => {
            const updateData: Partial<HandRaise> = {
               state: HandRaiseState.unrequested,
               timeStamp: Timestamp.now(),
            }

            batch.update(doc.ref, updateData)
         })
      }

      const updateData: Partial<LivestreamEvent> = {
         handRaiseActive: handRaise,
      }

      batch.update(livestreamRef, updateData)

      return batch.commit()
   }

   async syncCustomJobBusinessFunctionTagsToLivestreams(
      afterJob: CustomJob,
      beforeJob: CustomJob,
      changeType: ReturnType<typeof getChangeTypes>
   ): Promise<void> {
      functions.logger.log("Sync tags with live streams.")

      const updatePromises = []

      const businessFunctionTagsChanged = Boolean(
         _.xor(
            afterJob.businessFunctionsTagIds ?? [],
            beforeJob.businessFunctionsTagIds ?? []
         ).length
      )

      const hasLinkedEvents = Boolean(afterJob.livestreams.length)

      const addedLivestreams = getArrayDifference(
         beforeJob.livestreams ?? [],
         afterJob.livestreams ?? []
      ) as string[]

      const removedLivestreams = getArrayDifference(
         afterJob.livestreams ?? [],
         beforeJob.livestreams ?? []
      ) as string[]

      if (!hasLinkedEvents && !removedLivestreams.length) return

      const allEffectedEventIds = removedLivestreams.concat(
         afterJob.livestreams
      )

      const eventsQuery = this.firestore
         .collection("livestreams")
         .where("id", "in", allEffectedEventIds) // TODO: Check if limit using IN
         .withConverter(createCompatGenericConverter<LivestreamEvent>())

      const customJobsQuery = this.firestore
         .collection("customJobs")
         .where("livestreams", "array-contains-any", allEffectedEventIds) // TODO: LIMIT 30
         .withConverter(createCompatGenericConverter<CustomJob>())

      const customJobsSnapshot = await customJobsQuery.get()
      const eventsSnapshot = await eventsQuery.get()

      const customJobs =
         customJobsSnapshot.docs?.map((jobDoc) => jobDoc.data()) || []

      /**
       * Create a map allowing to retrieve for a given live stream id, all of the
       * @field businessFunctionsTagIds of @type CustomJob, for all custom jobs associated to that live stream
       * while ignoring the tags associated via the current custom job, which will be needed when
       * a custom job is deleted, only its tags are to be removed from the live stream, tags inferred from other
       * jobs must still remain.
       */
      const livestreamCustomJobsTagMap = Object.fromEntries(
         allEffectedEventIds.map((id) => {
            const eventJobs =
               customJobs.filter((job) => job.livestreams.includes(id)) || []
            const unrelatedCustomJobsTags = eventJobs
               .filter((job) => job.id != afterJob.id)
               .map((job) => job.businessFunctionsTagIds)
               .flat()
               .filter(Boolean)

            return [id, unrelatedCustomJobsTags]
         })
      )

      // When a customJob is being updated or created, if there are no tags, nothing to do
      if (changeType.isCreate || changeType.isUpdate) {
         if (hasLinkedEvents) {
            let eventsToUpdate = addedLivestreams

            // Less updates by only updating the current linked events when the tag has changed
            // other wise the tags sync will only be for the added live streams
            if (businessFunctionTagsChanged) {
               eventsToUpdate = eventsToUpdate.concat(afterJob.livestreams)
            }
            // Update livestreams tags for all events still on the customJob (update or create)
            // Filter the snapshots as the query includes also removed live streams from the customJob
            eventsSnapshot.docs
               ?.filter((event) => eventsToUpdate.includes(event.id))
               ?.map((eventDoc) => {
                  const eventLinkedJobTags =
                     eventDoc.data().linkedCustomJobsTagIds ?? []

                  // Always remove duplicates as adding or removing can produce duplicates
                  const mergedTags = removeDuplicates(
                     afterJob.businessFunctionsTagIds.concat(eventLinkedJobTags)
                  )

                  return eventDoc.ref.update({
                     linkedCustomJobsTagIds: mergedTags,
                  })
               })
               ?.forEach((promise) => updatePromises.push(promise))
         }

         if (removedLivestreams.length) {
            eventsSnapshot.docs
               ?.filter((event) => removedLivestreams.includes(event.id))
               ?.map((eventDoc) => {
                  const eventLinkedJobTags =
                     eventDoc.data().linkedCustomJobsTagIds ?? []

                  // When removing, keep only tags which were inferred by other custom jobs (other the one being updated)
                  const tagsData = eventLinkedJobTags.filter(
                     (jobTag) =>
                        livestreamCustomJobsTagMap[eventDoc.id].includes(
                           jobTag
                        ) && !afterJob.businessFunctionsTagIds.includes(jobTag)
                  )

                  const mergedTags = removeDuplicates(tagsData)
                  return eventDoc.ref.update({
                     linkedCustomJobsTagIds: mergedTags,
                  })
               })
               ?.forEach((promise) => updatePromises.push(promise))
         }
      } else if (changeType.isDelete) {
         // Remove all job tags from beforeJob for all linked live streams
         if (beforeJob.livestreams.length) {
            // Update livestreams tags for all events still on the customJob (update or create)
            // Filter the snapshots as the query includes also removed live streams from the customJob
            eventsSnapshot.docs
               ?.filter((event) => beforeJob.livestreams.includes(event.id))
               ?.map((eventDoc) => {
                  // Always remove duplicates as adding or removing can produce duplicates
                  const mergedTags = removeDuplicates(
                     livestreamCustomJobsTagMap[eventDoc.id]
                  )

                  return eventDoc.ref.update({
                     linkedCustomJobsTagIds: mergedTags,
                  })
               })
               ?.forEach((promise) => updatePromises.push(promise))
         }
      }

      const results = await Promise.allSettled(updatePromises)

      const errors = results.filter((res) => res.status == "rejected")

      if (errors.length) {
         logAndThrow("Error synching tags with live streams", {
            livestreamIds: afterJob.livestreams,
            customJobId: afterJob.id,
            errors: errors,
         })
      }

      functions.logger.log(
         `Updated live streams linked to customJob ${afterJob.id}`
      )
   }

   async syncDeleteCustomJobBusinessFunctionTagsToLivestreams(
      beforeJob: CustomJob
   ): Promise<void> {
      functions.logger.log("Sync deleted customJobs tags with Live streams.")
      const updatePromises = []

      if (!beforeJob.livestreams.length) return

      const eventsQuery = this.firestore
         .collection("livestreams")
         .where("id", "in", beforeJob.livestreams) // TODO: Check if limit using IN
         .withConverter(createCompatGenericConverter<LivestreamEvent>())

      const customJobsQuery = this.firestore
         .collection("customJobs")
         .where("livestreams", "array-contains-any", beforeJob.livestreams) // TODO: LIMIT 30
         .withConverter(createCompatGenericConverter<CustomJob>())

      const customJobsSnapshot = await customJobsQuery.get()
      const eventsSnapshot = await eventsQuery.get()

      const customJobs =
         customJobsSnapshot.docs?.map((jobDoc) => jobDoc.data()) || []

      /**
       * Create a map allowing to retrieve for a given event id, all of the
       * @field businessFunctionsTagIds of @type CustomJob, for all custom jobs associated to that event
       * while ignoring the tags associated via the current custom job, which will be needed when
       * a custom job is deleted. Only its tags are to be removed from the event, tags inferred from other
       * jobs must still remain.
       */
      const eventsCustomJobsTagMap = Object.fromEntries(
         beforeJob.livestreams.map((id) => {
            const eventJobs =
               customJobs.filter((job) => job.livestreams.includes(id)) || []
            const unrelatedCustomJobsTags = eventJobs
               .filter((job) => job.id != beforeJob.id)
               .map((job) => job.businessFunctionsTagIds)
               .flat()
               .filter(Boolean)

            return [id, unrelatedCustomJobsTags]
         })
      )
      console.log("🚀 ~ eventsCustomJobsTagMap:", eventsCustomJobsTagMap)

      console.log("🚀 ~ isDelete")
      // Remove all job tags from beforeJob for all linked live streams
      if (beforeJob.livestreams.length) {
         // Update event tags for all events still on the customJob (update or create)
         // Filter the snapshots as the query includes also removed live streams from the customJob
         eventsSnapshot.docs
            ?.filter((event) => beforeJob.livestreams.includes(event.id))
            ?.map((eventDoc) => {
               const eventLinkedJobTags =
                  eventDoc.data().linkedCustomJobsTagIds ?? []

               const tagsData = eventLinkedJobTags.filter((jobTag) => {
                  const eventTagsExcludingCurrentJob =
                     eventsCustomJobsTagMap[eventDoc.id]
                  console.log(
                     "🚀 ~ tagsData ~ eventTagsExcludingCurrentJob:",
                     eventTagsExcludingCurrentJob
                  )
                  return (
                     eventTagsExcludingCurrentJob.includes(jobTag) &&
                     !beforeJob.businessFunctionsTagIds.includes(jobTag)
                  )
               })

               // Always remove duplicates as adding or removing can produce duplicates
               const mergedTags = removeDuplicates(tagsData)

               return eventDoc.ref.update({
                  linkedCustomJobsTagIds: mergedTags,
               })
            })
            ?.forEach((promise) => updatePromises.push(promise))
      }

      const results = await Promise.allSettled(updatePromises)

      const errors = results.filter((res) => res.status == "rejected")

      if (errors.length) {
         logAndThrow(
            "Error synching deleted customJob tags with live streams",
            {
               livestreamIds: beforeJob.livestreams,
               customJobId: beforeJob.id,
               errors: errors,
            }
         )
      }

      functions.logger.log(
         `Updated live streams linked to customJob ${beforeJob.id}`
      )
   }
}

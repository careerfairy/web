import { createCompatGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Create } from "@careerfairy/shared-lib/commonTypes"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   GroupAdmin,
   GroupAdminNewEventEmailInfo,
} from "@careerfairy/shared-lib/groups"
import {
   Creator,
   mapCreatorToSpeaker,
} from "@careerfairy/shared-lib/groups/creators"
import {
   EventRating,
   EventRatingAnswer,
   LivestreamChatEntry,
   LivestreamEvent,
   LivestreamQueryOptions,
   LivestreamReminderTask,
   Speaker,
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
import { UserData } from "@careerfairy/shared-lib/users"
import { UserNotification } from "@careerfairy/shared-lib/users/userNotifications"
import {
   addUtmTagsToLink,
   chunkArray,
   getArrayDifference,
} from "@careerfairy/shared-lib/utils"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import { Expo, ExpoPushMessage } from "expo-server-sdk"
import type { Change } from "firebase-functions"
import * as functions from "firebase-functions"
import firebase from "firebase/compat"
import { isEmpty } from "lodash"
import { DateTime } from "luxon"
import uuid from "uuid-random"
import {
   DocumentSnapshot,
   FieldValue,
   Timestamp,
   firestore as firestoreAdmin,
} from "../api/firestoreAdmin"
import { customJobRepo } from "../api/repositories"
import { FunctionsLogger, getChangeTypes } from "../util"
import { CUSTOMERIO_EMAIL_TEMPLATES } from "./notifications/EmailTypes"
import { addOperations } from "./stats/livestream"
import type { OperationsToMake } from "./stats/util"
import { syncCustomJobLinkedContentTags } from "./tagging/tags"
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

   getAttendees(livestreamId: string): Promise<UserLivestreamData[]>

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

   /**
    * Gets all live stream data for a specific user
    * @param userAuthId - The user's auth ID
    * @returns Promise containing array of UserLivestreamData
    */
   getUserLivestreamData(userAuthId: string): Promise<UserLivestreamData[]>

   /**
    * Updates multiple UserLivestreamData documents in bulk
    * @param updateUserData - UserData objects used for update
    * @param userLivestreamDatas - Array of partial UserLivestreamData objects to update (must include id and livestreamId)
    */
   updateUserLivestreamData(
      updateUserData: UserData,
      userLivestreamDatas: UserLivestreamData[]
   ): Promise<void>

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
    * Notifies registered users of a starting live stream.
    * Iterates over the array of registered users associated with the live stream, creates a new UserNotification object for each,
    * and inserts it in the database.
    *
    * @param {LivestreamEvent} livestream
    * @returns {Promise<void>}
    */
   createLivestreamStartUserNotifications(
      livestream: LivestreamEvent
   ): Promise<void>

   /**
    * Notifies registered users of a starting live stream.
    * Iterates over the array of registered users associated with the live stream, creates a new UserNotification object for each,
    * and sends it to users that have pushToken.
    *
    * @param {LivestreamEvent} livestream
    * @returns {Promise<void>}
    */

   createLivestreamStartPushNotifications(
      livestream: LivestreamEvent
   ): Promise<void>

   /**
    * Update the hand raise state for a user in a live stream
    * @param livestreamId - The ID of the live stream.
    * @param handRaise - The new hand raise state.
    */
   updateHandRaise(livestreamId: string, handRaise: boolean): Promise<void>

   /**
    * Synchronizes the the business function tags from a customJob, to all the associated
    * live streams, also updates the tags on live streams which were removed from the jobs.
    * This means fetching all other jobs for the unlinked live streams, and keep for that event only
    * the other jobs tags.
    * @param afterJob customJob after update
    * @param beforeJob customJob before data update
    */
   syncCustomJobBusinessFunctionTagsToLivestreams(
      afterJob: CustomJob,
      beforeJob: CustomJob,
      changeType: ReturnType<typeof getChangeTypes>
   ): Promise<void>

   /**
    * Syncs creator data to live streams by updating speakers with matching creator IDs.
    * @param creator
    */
   syncCreatorDataToLivestreamSpeaker(
      creator: Change<DocumentSnapshot>
   ): Promise<void>

   /**
    * Updates the speaker or adhoc speaker on a live stream
    * @param livestreamId - Live stream id
    * @param speaker - Speaker to update
    * @returns The updated speaker
    */
   updateLivestreamSpeaker(
      livestreamId: string,
      speaker: Speaker
   ): Promise<Speaker>

   /**
    * Adds an ad hoc speaker to a live stream, this
    * speaker will not appear in live stream details dialog
    * only as a selectable speaker in the live stream page
    * @param livestreamId - Live stream id
    * @param speaker - Speaker to add
    * @returns The created speaker
    */
   addAdHocSpeaker(
      livestreamId: string,
      speaker: Create<Speaker>
   ): Promise<Speaker>

   /**
    * Synchronizes the 'hasJobs' flag for Group livestreams based on the changes in the custom job.
    * This function updates the 'hasJobs' flag for livestreams associated with the custom job.
    * @param afterJob The custom job after the update.
    * @param beforeJob The custom job before the update.
    */
   syncGroupLivestreamsHasJobsFlag(
      afterJob: CustomJob,
      beforeJob: CustomJob
   ): Promise<void>

   /**
    * Creates a reminder task for a livestream
    * @param livestreamId - The ID of the livestream
    * @param scheduledFor - The date and time the reminder task is scheduled for
    * @returns A promise that resolves when the task has been created
    */
   createReminderTask(
      livestreamId: string,
      scheduledFor: Timestamp
   ): Promise<void>

   /**
    * Updates a reminder task for a livestream
    * @param livestreamId - The ID of the livestream
    * @param taskId - The ID of the reminder task to update
    * @param reminderTask - Updated data for the reminder task
    * @returns A promise that resolves when the task has been updated
    */
   updateReminderTask(
      livestreamId: string,
      taskId: string,
      reminderTask: Pick<
         LivestreamReminderTask,
         "status" | "completedAt" | "results"
      >
   ): Promise<void>

   /**
    * Checks if a reminder task exists for a livestream
    * @param livestreamId - The ID of the livestream
    * @returns A promise that resolves to true if the task exists, false otherwise
    */
   checkReminderTaskExists(livestreamId: string): Promise<boolean>
}

export class LivestreamFunctionsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamFunctionsRepository
{
   private expo: Expo
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue
   ) {
      super(firestore, fieldValue)
      this.expo = new Expo()
   }

   async getUserLivestreamData(
      userAuthId: string
   ): Promise<UserLivestreamData[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("userLivestreamData")
         .withConverter(createCompatGenericConverter<UserLivestreamData>())
         .where("userId", "==", userAuthId)
         .get()

      if (!querySnapshot.empty) {
         return querySnapshot.docs.map((doc) => doc.data())
      }

      return []
   }
   async updateUserLivestreamData(
      updateUserData: UserData,
      userLivestreamDatas: UserLivestreamData[]
   ): Promise<void> {
      const bulkWriter = firestoreAdmin.bulkWriter()

      for (const userLivestreamData of userLivestreamDatas) {
         if (!userLivestreamData.id || !userLivestreamData.livestreamId) {
            functions.logger.warn("Missing required fields for update", {
               userLivestreamData,
            })
            continue
         }

         const toUpdate: Partial<UserLivestreamData> = { user: updateUserData }

         const ref = this.firestore
            .collection("livestreams")
            .doc(userLivestreamData.livestreamId)
            .collection("userLivestreamData")
            .doc(userLivestreamData.id)

         // @ts-ignore
         void bulkWriter.update(ref, toUpdate)
      }

      await bulkWriter.close()
   }

   async createLivestreamStartPushNotifications(
      livestream: LivestreamEvent
   ): Promise<void> {
      functions.logger.log(
         `Started creating live stream start push notifications for live stream ${livestream.id}`
      )

      const users = await this.getLivestreamUsers(livestream.id, "registered")

      if (!users || users.length === 0) {
         functions.logger.log(
            `No registered users found for live stream ${livestream.id}`
         )
         return
      }

      // Get all Expo push tokens
      const tokens = users
         .map((user) => user.user.fcmTokens || [])
         .flat()
         .filter((token) => Expo.isExpoPushToken(token))

      if (tokens.length === 0) {
         functions.logger.log(
            "No valid Expo push tokens found for registered users"
         )
         return
      }

      try {
         // Create the messages that you want to send to clients
         const messages = tokens.map<ExpoPushMessage>((pushToken) => ({
            to: pushToken,
            sound: "default",
            title: "Live Stream Starting",
            body: `${livestream.title} is starting now: Join before it ends!`,
            data: {
               livestreamId: livestream.id,
               type: "livestream_start",
               url: addUtmTagsToLink({
                  link: `${getHost()}/portal/livestream/${livestream.id}`,
                  source: "careerfairy",
                  medium: "push",
                  content: livestream.title,
                  campaign: "livestream_start",
               }),
            },
         }))

         // Chunk the messages to avoid rate limiting

         const chunks = this.expo.chunkPushNotifications(messages)
         const tickets = []

         for (const chunk of chunks) {
            try {
               const ticketChunk = await this.expo.sendPushNotificationsAsync(
                  chunk
               )
               tickets.push(...ticketChunk)
               functions.logger.log(
                  "Push notifications sent:",
                  ticketChunk.length
               )
            } catch (error) {
               functions.logger.error("Error sending chunk:", error)
            }
         }

         // Handle any errors
         tickets.forEach((ticket, index) => {
            if (ticket.status === "error") {
               functions.logger.error(
                  `Error sending to token chunk ${index}: ${ticket.message}`
               )
            }
         })
      } catch (error) {
         functions.logger.error("Error sending push notifications:", error)
         throw error
      }
   }

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

   async getAttendees(livestreamId: string): Promise<UserLivestreamData[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("userLivestreamData")
         .where("livestreamId", "==", livestreamId)
         .where("participated.date", "!=", null)
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

      const users = await this.getLivestreamUsers(livestream.id, "registered")

      if (!users || users.length === 0) {
         functions.logger.log(
            `No registered users found for livestream ${livestream.id}`
         )
         return
      }

      users.forEach((user) => {
         const ref = firestoreAdmin
            .collection("userData")
            .doc(user.id)
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

      functions.logger.log(`Notified ${users.length} users of livestream start`)

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
      functions.logger.log(
         `Sync tags with live streams from customJob: ${afterJob.id}`
      )

      // When creating data manually on firefoo an empty object is created first
      // this prevents doing any processing if no id is present, the remaining checks
      // for linked content is null safe and will also result in an early return for empty objects
      if (!afterJob?.id) return

      const updatePromises = []
      const updatedEvents = await syncCustomJobLinkedContentTags(
         afterJob,
         beforeJob,
         changeType,
         (job) => job?.livestreams ?? [],
         (livestreamIds) => this.getLivestreamsByIds(livestreamIds),
         (livestreamIds) =>
            customJobRepo.getCustomJobsByLinkedContentIds(
               "livestreams",
               livestreamIds
            )
      )

      updatedEvents
         .map((event) => {
            const collectionToUpdate = event.isDraft
               ? "draftLivestreams"
               : "livestreams"
            const ref = this.firestore
               .collection(collectionToUpdate)
               .withConverter(createCompatGenericConverter<LivestreamEvent>())
               .doc(event.id)

            functions.logger.log(
               `${event.isDraft ? "draft " : ""}live stream ${
                  event.id
               } tags after sync: ${event.linkedCustomJobsTagIds}`
            )
            return ref.update({
               linkedCustomJobsTagIds: event.linkedCustomJobsTagIds,
            })
         })
         .forEach((updatePromise) => updatePromises.push(updatePromise))

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

   async getLivestreamsByCreatorId(
      creatorId: string
   ): Promise<LivestreamEvent[]> {
      const livestreams = await this.firestore
         .collection("livestreams")
         .where("creatorsIds", "array-contains", creatorId)
         .withConverter(createCompatGenericConverter<LivestreamEvent>())
         .get()

      return livestreams.docs.map((doc) => doc.data())
   }

   async syncCreatorDataToLivestreamSpeaker(
      change: Change<DocumentSnapshot<Creator>>
   ): Promise<void> {
      const creator = change.after.data()

      if (!creator) {
         functions.logger.log("No creator data found in the change document.")
         return
      }

      functions.logger.log(`Syncing creator data for creator ID: ${creator.id}`)

      const livestreams = await this.getLivestreamsByCreatorId(creator.id)

      if (livestreams.length === 0) {
         functions.logger.log(
            `No livestreams found for creator ID: ${creator.id}`
         )
         return
      }

      functions.logger.log(
         `Found ${livestreams.length} livestream(s) for creator ID: ${creator.id}`
      )

      const bulkWriter = firestoreAdmin.bulkWriter()

      for (const livestream of livestreams) {
         const livestreamRef = this.firestore
            .collection("livestreams")
            .withConverter(createCompatGenericConverter<LivestreamEvent>())
            .doc(livestream.id)

         if (!livestream.speakers) {
            functions.logger.log(
               `No speakers found for livestream ID: ${livestream.id}`
            )
            continue
         }

         const updatedSpeakers = livestream.speakers.map((speaker) => {
            if (speaker.id === creator.id) {
               functions.logger.log(
                  `Updating speaker data for livestream ID: ${livestream.id}, speaker ID: ${speaker.id}`
               )
               // Merge existing speaker data with new creator data
               return {
                  ...speaker,
                  ...mapCreatorToSpeaker(creator),
               }
            }
            return speaker
         })

         void bulkWriter.update(livestreamRef as any, {
            speakers: updatedSpeakers,
         })
      }

      await bulkWriter.close()
      functions.logger.log(
         `Completed syncing creator data for creator ID: ${creator.id}`
      )
   }

   async updateLivestreamSpeaker(
      livestreamId: string,
      speaker: Speaker
   ): Promise<Speaker> {
      const stream = await this.getById(livestreamId)

      const updatedSpeakers =
         stream.speakers?.map((s) => {
            if (s.id === speaker.id) {
               return { ...s, ...speaker }
            }
            return s
         }) || []

      const updatedAdhocSpeakers =
         stream.adHocSpeakers?.map((s) => {
            if (s.id === speaker.id) {
               return { ...s, ...speaker }
            }
            return s
         }) || []

      const toUpdate: Pick<LivestreamEvent, "speakers" | "adHocSpeakers"> = {
         speakers: updatedSpeakers,
         adHocSpeakers: updatedAdhocSpeakers,
      }

      await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .update(toUpdate)

      return speaker
   }

   async addAdHocSpeaker(
      livestreamId: string,
      speaker: Create<Speaker>
   ): Promise<Speaker> {
      const speakerWithId: Speaker = {
         ...speaker,
         id: uuid().replace(/-/g, ""), // Remove the "-" from the uuid
      }

      const toUpdate: Pick<LivestreamEvent, "adHocSpeakers"> = {
         adHocSpeakers: FieldValue.arrayUnion(
            speakerWithId
         ) as unknown as Speaker[],
      }

      await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .update(toUpdate)

      return speakerWithId
   }

   async syncGroupLivestreamsHasJobsFlag(
      afterJob: CustomJob,
      beforeJob: CustomJob
   ): Promise<void> {
      // Check if the livestreams in afterJob and beforeJob are the same, regardless of order
      const areLivestreamsEqual =
         getArrayDifference(
            afterJob?.livestreams ?? [],
            beforeJob?.livestreams ?? []
         ).length === 0 &&
         getArrayDifference(
            beforeJob?.livestreams ?? [],
            afterJob?.livestreams ?? []
         ).length === 0

      if (areLivestreamsEqual) {
         // If the livestreams are the same, exit the function early
         return
      }

      // Get the livestreams that were added to afterJob
      const addedLivestreams = beforeJob
         ? (getArrayDifference(
              beforeJob?.livestreams ?? [],
              afterJob?.livestreams ?? []
           ) as string[])
         : afterJob.livestreams

      // Get the livestreams that were removed from beforeJob
      const removedLivestreams = beforeJob
         ? (getArrayDifference(
              afterJob?.livestreams ?? [],
              beforeJob?.livestreams ?? []
           ) as string[])
         : []

      // Get all customJobs from the group id
      const customJobs = await customJobRepo.getCustomJobsByGroupId(
         afterJob.groupId
      )

      // Remove the current job from the array
      const filteredCustomJobs = customJobs.filter(
         (job) => job.id !== afterJob.id
      )

      // Filter the livestreams that have been removed from the jobs
      const livestreamsWithoutJobs = removedLivestreams.filter(
         (livestreamId) => {
            return filteredCustomJobs.every(
               (job) => !job.livestreams.includes(livestreamId)
            )
         }
      )

      // Filter the livestreams that have been added to the jobs
      const livestreamsWithNewJobAssignment = addedLivestreams.filter(
         (livestreamId) => {
            return !filteredCustomJobs.some((job) =>
               job.livestreams.includes(livestreamId)
            )
         }
      )

      const batch = this.firestore.batch()

      // Update the livestreams without jobs to have hasJobs: false
      livestreamsWithoutJobs.forEach((livestreamId) => {
         functions.logger.log(
            `Update live stream ${livestreamId} to be with hasJobs flag as false`
         )
         batch.update(
            this.firestore.collection("livestreams").doc(livestreamId),
            {
               hasJobs: false,
            }
         )
      })

      // Update the livestreams with new job assignment to have hasJobs: true
      livestreamsWithNewJobAssignment.forEach((livestreamId) => {
         functions.logger.log(
            `Update live stream ${livestreamId} to be with hasJobs flag as true`
         )

         batch.update(
            this.firestore.collection("livestreams").doc(livestreamId),
            {
               hasJobs: true,
            }
         )
      })

      await batch.commit()
   }

   async createReminderTask(
      livestreamId: string,
      scheduledFor: Timestamp
   ): Promise<void> {
      const reminderTask: LivestreamReminderTask = {
         status: "waiting",
         scheduledFor: scheduledFor,
         createdAt: Timestamp.now(),
         completedAt: null,
         cancelledAt: null,
         results: null,
         id: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW,
      }

      return this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("reminderTasks")
         .doc(reminderTask.id)
         .set(reminderTask)
   }

   async updateReminderTask(
      livestreamId: string,
      taskId: string,
      reminderTask: Pick<
         LivestreamReminderTask,
         "status" | "completedAt" | "results"
      >
   ): Promise<void> {
      return this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("reminderTasks")
         .doc(taskId)
         .update(reminderTask)
   }

   async checkReminderTaskExists(livestreamId: string): Promise<boolean> {
      const taskDoc = await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("reminderTasks")
         .doc("joinReminder")
         .get()

      return taskDoc.exists
   }
}

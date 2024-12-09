import {
   createCompatGenericConverter,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   CompanyFollowed,
   RegisteredLivestreams,
   UserData,
} from "@careerfairy/shared-lib/users"
import {
   FirebaseUserRepository,
   IUserRepository,
} from "@careerfairy/shared-lib/users/UserRepository"
import {
   addUtmTagsToLink,
   isWithinNormalizationLimit,
} from "@careerfairy/shared-lib/utils"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import { Expo, ExpoPushMessage } from "expo-server-sdk"
import * as functions from "firebase-functions"
import firebase from "firebase/compat"
import { DateTime } from "luxon"
import { livestreamsRepo } from "../api/repositories"

const SUBSCRIBED_BEFORE_MONTHS_COUNT = 18

export interface IUserFunctionsRepository extends IUserRepository {
   getSubscribedUsers(
      userEmails?: string[],
      locationFilters?: string[],
      lastActivityMonths?: number
   ): Promise<UserData[]>

   getSubscribedUsersByCountryCodes(
      countryCodes: string[],
      userEmails?: string[]
   ): Promise<UserData[]>
   /**
    * Retrieves the subscribed users, which were created earlier than a given number of days.
    * Differs also from @method getSubscribedUsers on the where clause, using @field createdAt instead of @field lastActivityAt for
    * date comparison.
    * @param userEmails Optional list of emails to filter results by
    * @param earlierThanDays Number of days to compare with creation date (creationDate >= today - earlierThanDays)
    */
   getSubscribedUsersEarlierThan(
      userEmails?: string[],
      earlierThanDays?: number
   ): Promise<UserData[]>

   getGroupFollowers(groupId: string): Promise<CompanyFollowed[]>

   /**
    * Retrieves the registered users, which were created earlier than 3 days and older than 2 days.
    * And sends push notifications
    */
   getRegisteredUsersWithinTwoDaysAndSendNotifications(): Promise<void>

   /**
    * Retrieves the registered users, which were created earlier than 5 days and older than 4 days.
    * And sends push notifications if they have not registered for any livestream
    */
   getRegisteredUsersWithinFourDaysAndSendNotifications(): Promise<void>

   /**
    * Retrieves all the registered live streams for users
    * @returns All the registered live streams for users
    */
   getAllUserRegisteredLivestreams(
      userEmails?: string[],
      locationFilters?: string[]
   ): Promise<RegisteredLivestreams[]>
}

export class UserFunctionsRepository
   extends FirebaseUserRepository
   implements IUserFunctionsRepository
{
   private expo: Expo
   constructor(
      readonly firestore: firebase.firestore.Firestore,
      readonly fieldValue: typeof firebase.firestore.FieldValue,
      readonly timestamp: typeof firebase.firestore.Timestamp
   ) {
      super(firestore, fieldValue, timestamp)
      this.expo = new Expo()
   }

   async getSubscribedUsers(
      userEmails?: string[],
      locationFilters?: string[],
      lastActivityMonths?: number
   ): Promise<UserData[]> {
      const earlierThan = DateTime.now()
         .minus({
            months:
               lastActivityMonths !== undefined
                  ? lastActivityMonths
                  : SUBSCRIBED_BEFORE_MONTHS_COUNT,
         })
         .toJSDate()

      let query = this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("lastActivityAt", ">=", earlierThan)

      if (locationFilters?.length) {
         query = query.where("universityCountryCode", "in", locationFilters)
      }

      if (userEmails?.length) {
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
      }

      const data = await query.get()

      return mapFirestoreDocuments(data)
   }

   async getSubscribedUsersByCountryCodes(
      countryCodes: string[],
      userEmails?: string[]
   ): Promise<UserData[]> {
      let query = this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("universityCountryCode", "in", countryCodes)

      if (userEmails?.length) {
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
      }

      const data = await query.get()

      return mapFirestoreDocuments(data)
   }

   async getSubscribedUsersEarlierThan(
      userEmails?: string[],
      earlierThanDays?: number
   ): Promise<UserData[]> {
      const minusDays = earlierThanDays || SUBSCRIBED_BEFORE_MONTHS_COUNT * 31 // Convert months to days
      const earlierThan = DateTime.now().minus({ days: minusDays }).toJSDate()

      let query = this.firestore
         .collection("userData")
         .where("unsubscribed", "==", false)
         .where("createdAt", ">=", earlierThan)

      if (userEmails?.length) {
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
      }

      const data = await query.get()

      return mapFirestoreDocuments(data)
   }

   async getRegisteredUsersWithinTwoDaysAndSendNotifications(): Promise<void> {
      const earlierThan = DateTime.now().minus({ days: 2 }).toJSDate()
      const thirdDay = DateTime.now().minus({ days: 3 }).toJSDate()

      try {
         const query = this.firestore
            .collection("userData")
            .where("createdAt", "<=", earlierThan)
            .where("createdAt", ">=", thirdDay)

         const usersSnapshot = await query.get()

         const users = []

         for (const doc of usersSnapshot.docs) {
            const userData = doc.data()
            const seenSparksSnapshot = await this.firestore
               .collection("userData")
               .doc(doc.id)
               .collection("seenSparks")
               .limit(1)
               .get()

            if (seenSparksSnapshot.empty) {
               users.push({ id: doc.id, ...userData })
            }
         }

         if (!users || users.length === 0) {
            functions.logger.log(
               "No registered users that were created and not watched sparks found"
            )
            return
         }

         // Get all Expo push tokens
         const tokens = users
            .map((user) => user.fcmTokens || [])
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
               title: "Inside scoop for you!",
               body: "Want a behind-the-scenes look at top companies? Swipe through Sparks videos.",
               data: {
                  type: "onboarding_start",
                  url: addUtmTagsToLink({
                     link: `${getHost()}/sparks`,
                     source: "careerfairy",
                     medium: "push",
                     content: "sparks",
                     campaign: "onboarding",
                  }),
               },
            }))

            // Chunk the messages to avoid rate limiting

            const chunks = this.expo.chunkPushNotifications(messages)
            const tickets = []

            for (const chunk of chunks) {
               try {
                  const ticketChunk =
                     await this.expo.sendPushNotificationsAsync(chunk)
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
         }
      } catch (error) {
         console.error("Error fetching users:", error)
      }
   }

   async getRegisteredUsersWithinFourDaysAndSendNotifications(): Promise<void> {
      const earlierThan = DateTime.now().minus({ days: 4 }).toJSDate()
      const fifthDay = DateTime.now().minus({ days: 5 }).toJSDate()
      const today = DateTime.now().toJSDate()
      const oneMonth = DateTime.now().plus({ days: 30 }).toJSDate()

      try {
         const query = this.firestore
            .collection("userData")
            .where("createdAt", "<=", earlierThan)
            .where("createdAt", ">=", fifthDay)

         const livestreamQuery = this.firestore
            .collection("livestreams")
            .where("start", ">=", today)
            .where("start", "<=", oneMonth)

         const usersSnapshot = await query.get()
         const livestreamSnapshot = await livestreamQuery.get()

         const users = []

         if (livestreamSnapshot.size < 8) {
            functions.logger.log(
               "Fewer than 8 live streams in the next 30 days, skipping"
            )
            return
         }

         for (const doc of usersSnapshot.docs) {
            const userData = doc.data() as UserData

            const userLivestreamDatas =
               await livestreamsRepo.getUserLivestreamData(userData.authId)

            if (!userLivestreamDatas || userLivestreamDatas.length === 0) {
               users.push({ id: doc.id, ...userData })
            }
         }

         if (!users || users.length === 0) {
            functions.logger.log(
               "No registered users that were created and not registered for livestream found"
            )
            return
         }

         // Get all Expo push tokens
         const tokens = users
            .map((user) => user.fcmTokens || [])
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
               title: "Did you know?",
               body: `${livestreamSnapshot.size} live streams in the next 30 days. Register to find your ideal first job.`,
               data: {
                  type: "onboarding_start",
                  url: addUtmTagsToLink({
                     link: `${getHost()}/next-livestreams`,
                     source: "careerfairy",
                     medium: "push",
                     content: "livestream",
                     campaign: "onboarding",
                  }),
               },
            }))

            // Chunk the messages to avoid rate limiting

            const chunks = this.expo.chunkPushNotifications(messages)
            const tickets = []

            for (const chunk of chunks) {
               try {
                  const ticketChunk =
                     await this.expo.sendPushNotificationsAsync(chunk)
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
         }
      } catch (error) {
         console.error("Error fetching users:", error)
      }
   }

   async getGroupFollowers(groupId: string): Promise<CompanyFollowed[]> {
      const querySnapshot = await this.firestore
         .collectionGroup("companiesUserFollows")
         .where("id", "==", groupId)
         .get()

      return querySnapshot.docs?.map((doc) => doc.data() as CompanyFollowed)
   }

   async getAllUserRegisteredLivestreams(
      userEmails?: string[],
      locationFilters?: string[]
   ): Promise<RegisteredLivestreams[]> {
      const earlierThan = DateTime.now()
         .minus({ months: SUBSCRIBED_BEFORE_MONTHS_COUNT })
         .toJSDate()

      let query = this.firestore
         .collection("registeredLivestreams")
         .withConverter(createCompatGenericConverter<RegisteredLivestreams>())
         .where("unsubscribed", "==", false)
         .where("lastActivityAt", ">=", earlierThan)

      if (locationFilters?.length) {
         query = query.where("universityCountryCode", "in", locationFilters)
      }

      if (userEmails?.length) {
         const withinLimit = isWithinNormalizationLimit(30, userEmails)
         if (withinLimit) {
            query = query.where("userEmail", "in", userEmails)
         }
      }

      const querySnapshot = await query.get()

      return querySnapshot.docs.map((doc) => doc.data())
   }
}

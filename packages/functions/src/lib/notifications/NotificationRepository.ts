import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { addUtmTagsToLink } from "@careerfairy/shared-lib/utils"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import { APIClient, SendPushRequest } from "customerio-node"
import * as functions from "firebase-functions"
import {
   createPushNotificationData,
   CustomerIoMessageData,
   CustomerIoMessageType,
} from "./CustomerIoTypes"
import { CUSTOMERIO_MESSAGE_IDS } from "./NotificationConstants"

/**
 * Interface for notification services
 */
export interface INotificationRepository {
   /**
    * Notifies registered users of a starting live stream.
    * Iterates over the array of registered users associated with the live stream and sends notifications
    * to users that have appropriate tokens.
    *
    * @param livestream - The livestream event that has started
    * @param registeredUsers - Array of users to notify.
    */
   sendLivestreamStartNotifications(
      livestream: LivestreamEvent,
      registeredUsers: UserLivestreamData[] | null
   ): Promise<void>
}

/**
 * Implementation of notifications using Customer.io
 */
export class NotificationRepository implements INotificationRepository {
   private cioApi: APIClient

   constructor(cioApi: APIClient) {
      this.cioApi = cioApi
   }

   async sendLivestreamStartNotifications(
      livestream: LivestreamEvent,
      registeredUsers: UserLivestreamData[] | null = null
   ): Promise<void> {
      functions.logger.log(
         `Started creating notifications for live stream ${livestream.id}`
      )

      if (!registeredUsers || registeredUsers.length === 0) {
         functions.logger.log(
            `No registered users found for live stream ${livestream.id} - skipping notifications`
         )
         return
      }

      functions.logger.log(
         `Found ${registeredUsers.length} registered users for live stream ${livestream.id}`
      )

      // Prepare notification data for each user
      const notificationsData: SendPushNotificationData<CustomerIoMessageType>[] =
         registeredUsers.map((user) => ({
            userAuthId: user.user.authId,
            messageType: CUSTOMERIO_MESSAGE_IDS.LIVESTREAM_START.type,
            data: {
               live_stream_title: livestream.title,
               company_logo_url: livestream.companyLogoUrl,
               url: addUtmTagsToLink({
                  link: `${getHost()}/portal/livestream/${livestream.id}`,
                  source: "careerfairy",
                  medium: "push",
                  content: livestream.title,
                  campaign: "livestream_start",
               }),
            },
         }))

      // Send notifications and get results
      const { successful, failed } = await this.sendPushNotifications(
         notificationsData
      )

      functions.logger.log(
         `Notifications sent: ${successful} successful, ${failed} failed`
      )
   }

   /**
    * Private helper method to send push notifications to multiple users
    *
    * @param notificationsData - Array of notification data objects containing userAuthId, messageType, and data
    * @returns Object with counts of successful and failed notifications
    */
   private async sendPushNotifications<T extends CustomerIoMessageType>(
      notificationsData: SendPushNotificationData<T>[]
   ): Promise<{ successful: number; failed: number }> {
      // Process all notifications at once
      const notificationPromises = notificationsData.map((notificationData) => {
         // Create a notification request using Customer.io with type safety
         const requestData = createPushNotificationData(
            notificationData.messageType,
            notificationData.data,
            notificationData.userAuthId
         )

         const request = new SendPushRequest(requestData)

         // Send the notification
         return {
            userAuthId: notificationData.userAuthId,
            promise: this.cioApi.sendPush(request),
         }
      })

      const results = await Promise.allSettled(
         notificationPromises.map(({ userAuthId, promise }) =>
            promise.catch((error) => {
               functions.logger.error(
                  `Error sending notification to user ${userAuthId}:`,
                  error
               )
               return null
            })
         )
      )

      const successful = results.filter(
         (result) => result.status === "fulfilled" && result.value !== null
      ).length
      const failed = results.filter(
         (result) => result.status === "rejected" || result.value === null
      ).length

      return { successful, failed }
   }
}

type SendPushNotificationData<T extends CustomerIoMessageType> = {
   userAuthId: string
   messageType: T
   data: CustomerIoMessageData[T]
}

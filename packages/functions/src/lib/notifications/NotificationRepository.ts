import { APIClient, SendPushRequest } from "customerio-node"
import * as functions from "firebase-functions"
import {
   createPushNotificationRequestData,
   CustomerIoPushMessageType,
   PushNotificationRequestData,
} from "./PushNotificationTypes"

type SendPushRequestResponse = {
   /**
    * The number of notifications that were sent successfully
    */
   successful: number
   /**
    * The number of notifications that failed to send
    */
   failed: number
}

/**
 * Interface for notification services
 */
export interface INotificationRepository {
   /**
    * Helper method to send push notifications to multiple users
    *
    * @param notificationsData - Array of notification data objects containing userAuthId, templateType, and templateData
    * @returns Object with counts of successful and failed notifications
    */
   sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[]
   ): Promise<SendPushRequestResponse>
}

/**
 * Implementation of notifications using Customer.io
 */
export class NotificationRepository implements INotificationRepository {
   private cioApi: APIClient

   constructor(cioApi: APIClient) {
      this.cioApi = cioApi
   }

   async sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[]
   ): Promise<SendPushRequestResponse> {
      const notificationPromises = notificationsData.map((notificationData) => {
         const requestData = createPushNotificationRequestData(notificationData)

         const request = new SendPushRequest(requestData)

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

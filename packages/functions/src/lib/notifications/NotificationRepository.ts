import { APIClient, SendEmailRequest, SendPushRequest } from "customerio-node"
import * as functions from "firebase-functions"
import {
   createEmailNotificationRequestData,
   CustomerIoEmailMessageType,
   EmailNotificationRequestData,
} from "./EmailTypes"
import {
   createPushNotificationRequestData,
   CustomerIoPushMessageType,
   PushNotificationRequestData,
} from "./PushNotificationTypes"

type SendRequestResponse = {
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
    * Sends email notifications in batches to multiple users
    *
    * @param notificationsData - Array of notification data objects
    * @returns Object with counts of successful and failed notifications
    */
   sendEmailNotifications<T extends CustomerIoEmailMessageType>(
      notificationsData: EmailNotificationRequestData<T>[]
   ): Promise<SendRequestResponse>

   /**
    * Sends push notifications in batches to multiple users
    *
    * @param notificationsData - Array of notification data objects
    * @returns Object with counts of successful and failed notifications
    */
   sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[]
   ): Promise<SendRequestResponse>
}

/**
 * Implementation of notifications using Customer.io
 */
export class NotificationRepository implements INotificationRepository {
   private cioApi: APIClient
   protected batchSize = 250

   constructor(cioApi: APIClient) {
      this.cioApi = cioApi
   }

   async sendEmailNotifications<T extends CustomerIoEmailMessageType>(
      notificationsData: EmailNotificationRequestData<T>[]
   ): Promise<SendRequestResponse> {
      return this.processBatches(
         notificationsData,
         (data) => {
            const requestData = createEmailNotificationRequestData(data)
            const request = new SendEmailRequest(requestData)

            // Add attachments if they exist
            if (data.attachments && data.attachments.length > 0) {
               data.attachments.forEach((attachment) => {
                  request.attach(attachment.filename, attachment.content)
               })

               functions.logger.info(
                  `Added ${data.attachments.length} attachments to email for user ${data.userAuthId}`
               )
            }

            return {
               id: data.userAuthId,
               promise: this.cioApi.sendEmail(request),
            }
         },
         `email notifications for ${notificationsData[0].templateType}`
      )
   }

   async sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[]
   ): Promise<SendRequestResponse> {
      return this.processBatches(
         notificationsData,
         (data) => {
            const requestData = createPushNotificationRequestData(data)
            const request = new SendPushRequest(requestData)
            return {
               id: data.userAuthId,
               promise: this.cioApi.sendPush(request),
            }
         },
         `push notifications for ${notificationsData[0].templateId}`
      )
   }

   /**
    * Generic method to process items in batches
    *
    * @param items - Array of items to process
    * @param processItem - Function to process a single item and return a promise
    * @param itemType - Type of items being processed (for logging)
    * @returns Object with counts of successful and failed items
    */
   protected async processBatches<T, R>(
      items: T[],
      processItem: (item: T) => { id: string; promise: Promise<R> },
      itemType: string
   ): Promise<SendRequestResponse> {
      // If no items to process, return early
      if (items.length === 0) {
         return { successful: 0, failed: 0 }
      }

      // Process items in batches
      const batches: T[][] = []

      for (let i = 0; i < items.length; i += this.batchSize) {
         batches.push(items.slice(i, i + this.batchSize))
      }

      functions.logger.info(
         `Processing ${items.length} ${itemType} in ${batches.length} batches`
      )

      let totalSuccessful = 0
      let totalFailed = 0

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
         const batch = batches[i]
         functions.logger.info(
            `Processing batch ${i + 1}/${batches.length} with ${
               batch.length
            } ${itemType}`
         )

         const batchResult = await this.processSingleBatch(
            batch,
            processItem,
            itemType
         )

         totalSuccessful += batchResult.successful
         totalFailed += batchResult.failed
      }

      return { successful: totalSuccessful, failed: totalFailed }
   }

   /**
    * Process a single batch of items
    *
    * @param batch - Batch of items to process
    * @param processItem - Function to process a single item and return a promise
    * @param itemType - Type of items being processed (for logging)
    * @returns Object with counts of successful and failed items for this batch
    */
   private async processSingleBatch<T, R>(
      batch: T[],
      processItem: (item: T) => { id: string; promise: Promise<R> },
      itemType: string
   ): Promise<SendRequestResponse> {
      const itemPromises = batch.map(processItem)

      const results = await Promise.allSettled(
         itemPromises.map(({ id, promise }) =>
            promise.catch((error) => {
               functions.logger.error(
                  `Error sending ${itemType} to ${id}:`,
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

import { APIClient, SendEmailRequest, SendPushRequest } from "customerio-node"
import * as functions from "firebase-functions"
import {
   createEmailNotificationRequestData,
   CustomerIoEmailTemplateId,
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
 * Progress information for batch processing
 */
export type ProgressInfo = {
   /**
    * The current batch index (0-based)
    */
   batchIndex: number
   /**
    * The total number of batches
    */
   totalBatches: number
   /**
    * The number of successful items in the current batch
    */
   batchSuccessful: number
   /**
    * The number of failed items in the current batch
    */
   batchFailed: number
   /**
    * The total number of successful items across all processed batches
    */
   totalSuccessful: number
   /**
    * The total number of failed items across all processed batches
    */
   totalFailed: number
   /**
    * The total number of items being processed
    */
   totalItems: number

   /**
    * The type of items being processed
    */
   itemType: string
}

/**
 * Callback function for tracking progress of batch processing
 */
export type OnBatchCompleteCallback = (progress: ProgressInfo) => void

/**
 * Interface for notification services
 */
export interface INotificationRepository {
   /**
    * Sends email notifications in batches to multiple users
    *
    * @param notificationsData - Array of notification data objects
    * @param progressCallback - Optional callback for tracking progress
    * @returns Object with counts of successful and failed notifications
    */
   sendEmailNotifications<T extends CustomerIoEmailTemplateId>(
      notificationsData: EmailNotificationRequestData<T>[],
      progressCallback?: OnBatchCompleteCallback
   ): Promise<SendRequestResponse>

   /**
    * Sends push notifications in batches to multiple users
    *
    * @param notificationsData - Array of notification data objects
    * @param progressCallback - Optional callback for tracking progress
    * @returns Object with counts of successful and failed notifications
    */
   sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[],
      progressCallback?: OnBatchCompleteCallback
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

   async sendEmailNotifications<T extends CustomerIoEmailTemplateId>(
      notificationsData: EmailNotificationRequestData<T>[],
      onBatchCompleteCallback?: OnBatchCompleteCallback
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
            }

            return {
               id: data.userAuthId,
               promise: this.cioApi.sendEmail(request),
            }
         },
         `email notifications for ${
            notificationsData[0]?.templateId || "unknown template"
         }`,
         onBatchCompleteCallback
      )
   }

   async sendPushNotifications<T extends CustomerIoPushMessageType>(
      notificationsData: PushNotificationRequestData<T>[],
      onBatchCompleteCallback?: OnBatchCompleteCallback
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
         `push notifications for ${
            notificationsData[0]?.templateId || "unknown template"
         }`,
         onBatchCompleteCallback
      )
   }

   /**
    * Generic method to process items in batches
    *
    * @param items - Array of items to process
    * @param processItem - Function to process a single item and return a promise
    * @param itemType - Type of items being processed (for logging)
    * @param onBatchComplete - Optional callback for tracking progress
    * @returns Object with counts of successful and failed items
    */
   protected async processBatches<T, R>(
      items: T[],
      processItem: (item: T) => { id: string; promise: Promise<R> },
      itemType: string,
      onBatchCompleteCallback?: OnBatchCompleteCallback
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

         // Call the progress callback if provided
         if (onBatchCompleteCallback) {
            onBatchCompleteCallback({
               batchIndex: i,
               totalBatches: batches.length,
               batchSuccessful: batchResult.successful,
               batchFailed: batchResult.failed,
               totalSuccessful,
               totalFailed,
               totalItems: items.length,
               itemType,
            })
         }
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

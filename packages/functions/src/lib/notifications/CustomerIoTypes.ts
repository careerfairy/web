import { CUSTOMERIO_MESSAGE_IDS } from "./NotificationConstants"

export type CustomerIoMessageType =
   (typeof CUSTOMERIO_MESSAGE_IDS)[keyof typeof CUSTOMERIO_MESSAGE_IDS]["type"]

/**
 * Base interface for all message data
 */
export interface BaseMessageData {
   url: string
}

/**
 * Message data for livestream start notifications
 */
export interface LivestreamStartMessageData extends BaseMessageData {
   company_logo_url?: string
   live_stream_title: string
}

/**
 * Union type of all possible message data types
 */
export type CustomerIoMessageData = {
   [CUSTOMERIO_MESSAGE_IDS.LIVESTREAM_START.type]: LivestreamStartMessageData
}

/**
 * Type-safe function to create a push notification request
 * @param messageType The type of message to create
 * @param data The message data specific to the message ID
 * @param userAuthId The user ID to send the notification to
 * @returns An object with the correctly typed message data
 */
export function createPushNotificationData<T extends CustomerIoMessageType>(
   messageType: T,
   data: CustomerIoMessageData[T],
   userAuthId: string
) {
   return {
      transactional_message_id: CUSTOMERIO_MESSAGE_IDS[messageType].id,
      message_data: data,
      identifiers: {
         id: userAuthId,
      },
   }
}

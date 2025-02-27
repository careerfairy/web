import { SendPushRequestOptions } from "customerio-node/dist/lib/api/requests"

/**
 * Customer.io transactional message IDs
 */
export const CUSTOMERIO_PUSH_TEMPLATES = {
   LIVESTREAM_START: "live_stream_start",
} as const satisfies Record<string, string>

export type CustomerIoPushMessageType =
   (typeof CUSTOMERIO_PUSH_TEMPLATES)[keyof typeof CUSTOMERIO_PUSH_TEMPLATES]

/**
 * Base interface for all message data
 */
export interface BasePushMessageData {
   url: string
}

/**
 * Message data for livestream start notifications
 */
export interface LivestreamStartPushMessageData extends BasePushMessageData {
   company_logo_url: string
   live_stream_title: string
}

/**
 * Union type of all possible message data types
 */
export type CustomerIoPushMessageData = {
   [CUSTOMERIO_PUSH_TEMPLATES.LIVESTREAM_START]: LivestreamStartPushMessageData
}

export type PushNotificationRequestData<T extends CustomerIoPushMessageType> = {
   /**
    * The type of message to create
    */
   templateId: T
   /**
    * Custom data you would like to send to the message template
    */
   templateData: CustomerIoPushMessageData[T]
   /**
    * The users auth ID to send the notification to
    */
   userAuthId: string
} & Omit<
   SendPushRequestOptions,
   "transactional_message_id" | "message_data" | "identifiers"
>

/**
 * Type-safe function to create a push notification request
 * @param params Object containing message type, data and user ID
 * @param params.messageType The type of message to create
 * @param params.data The message data specific to the message ID
 * @param params.userAuthId The user ID to send the notification to
 * @returns An object with the correctly typed message data
 */
export function createPushNotificationRequestData<
   T extends CustomerIoPushMessageType
>({
   templateId,
   templateData,
   userAuthId,
   ...rest
}: PushNotificationRequestData<T>): SendPushRequestOptions {
   return {
      ...rest,
      transactional_message_id: templateId,
      message_data: templateData,
      identifiers: {
         id: userAuthId,
      },
   }
}

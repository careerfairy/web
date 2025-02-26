import { SendEmailRequestOptions } from "customerio-node/dist/lib/api/requests"

/**
 * Customer.io transactional message IDs
 */
export const CUSTOMERIO_EMAIL_TEMPLATES = {
   LIVESTREAM_REGISTRATION: {
      messageId:
         process.env
            .CUSTOMERIO_EMAIL_TEMPLATE_LIVESTREAM_REGISTRATION_CONFIRMATION,
      type: "LIVESTREAM_REGISTRATION",
   },
} as const satisfies Record<string, { messageId: string; type: string }>

export type CustomerIoEmailMessageType =
   (typeof CUSTOMERIO_EMAIL_TEMPLATES)[keyof typeof CUSTOMERIO_EMAIL_TEMPLATES]["type"]

/**
 * Message data for livestream start notifications
 */
export interface LivestreamRegistrationTemplateData {
   livestream: {
      title: string
      company: string
      start: string
      companyBannerImageUrl: string
   }
   jobs?: {
      url: string
      title: string
      jobType: string
      businessFunctionsTags?: string
      deadline?: string
   }[]
   speakers?: {
      name: string
      position: string
      avatarUrl: string
      url: string
   }[]
   sparks?: {
      question: string
      category_id: string
      thumbnailUrl: string
      url: string
   }[]
   calendar: {
      google: string
      outlook: string
      apple: string
   }
   livestreamUrl?: string
}

/**
 * Union type of all possible message data types
 */
export type CustomerIoEmailMessageData = {
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REGISTRATION
      .type]: LivestreamRegistrationTemplateData
}

export type EmailAttachment = {
   filename: string
   content: Buffer | string
}

export type EmailNotificationRequestData<T extends CustomerIoEmailMessageType> =
   {
      /**
       * The type of message to create
       */
      templateType: T
      /**
       * Custom data you would like to send to the message template
       */
      templateData: CustomerIoEmailMessageData[T]
      /**
       * The users auth ID to send the notification to
       */
      userAuthId: string
      /**
       * Optional attachments for the email
       * Each attachment should be an object with filename and content (base64 encoded)
       */
      attachments?: EmailAttachment[]
   } & Omit<
      SendEmailRequestOptions,
      "transactional_message_id" | "message_data" | "identifiers"
   >

/**
 * Type-safe function to create a email request
 * @param params Object containing message type, data and user ID
 * @param params.messageType The type of message to create
 * @param params.data The message data specific to the message ID
 * @param params.userAuthId The user ID to send the notification to
 * @param params.attachments Optional array of attachments (filename and content)
 * @returns An object with the correctly typed message data
 *
 * @example
 * // Example of sending an email with an attachment
 * const emailData: EmailNotificationRequestData<typeof CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_START.type> = {
 *   templateType: CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_START.type,
 *   templateData: {
 *     url: "https://example.com/livestream",
 *     company_logo_url: "https://example.com/logo.png",
 *     live_stream_title: "Exciting Livestream"
 *   },
 *   userAuthId: "user123",
 *   attachments: [
 *     {
 *       filename: "schedule.pdf",
 *       content: fs.readFileSync("path/to/schedule.pdf")
 *     }
 *   ]
 * };
 *
 * await notificationRepository.sendEmailNotifications([emailData]);
 */
export function createEmailNotificationRequestData<
   T extends CustomerIoEmailMessageType
>({
   templateType,
   templateData,
   userAuthId,
   ...rest
}: EmailNotificationRequestData<T>): SendEmailRequestOptions {
   return {
      ...rest,
      transactional_message_id:
         CUSTOMERIO_EMAIL_TEMPLATES[templateType].messageId,
      message_data: templateData,
      identifiers: {
         id: userAuthId,
      },
   }
}

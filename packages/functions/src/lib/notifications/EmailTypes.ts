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

/**
 * Represents an email attachment to be sent with an email notification.
 * @remarks
 * The content of the attachment must be a base64 encoded string.
 */
export type EmailAttachment = {
   /**
    * The filename of the attachment, including extension.
    * Special characters will be handled by the email service.
    */
   filename: string

   /**
    * The content of the attachment.
    * Must be a base64 encoded string.
    */
   content: string
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
       * Optional attachments for the email.
       * Each attachment should have a filename and content.
       * Content can be provided as either a Buffer or a string.
       * All content will be automatically encoded to base64 before sending.
       */
      attachments?: EmailAttachment[]
   } & Omit<
      SendEmailRequestOptions,
      "transactional_message_id" | "message_data" | "identifiers"
   >

/**
 * Creates a type-safe email notification request
 * @param params.templateType Type of message to create
 * @param params.templateData Message data for the template
 * @param params.userAuthId User ID to send to
 * @param params.attachments Optional email attachments
 * @returns Email request options object
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

import { JobType } from "@careerfairy/shared-lib/customJobs/customJobs"
import { SendEmailRequestOptions } from "customerio-node/dist/lib/api/requests"

/**
 * Customer.io transactional message IDs
 */
export const CUSTOMERIO_EMAIL_TEMPLATES = {
   LIVESTREAM_REGISTRATION: "live_stream_registration_confirmation",
   LIVESTREAM_REMINDER_24H: "live_stream_reminder_24h",
   LIVESTREAM_REMINDER_1H: "live_stream_reminder_1h",
   LIVESTREAM_REMINDER_5M: "live_stream_reminder_5min",
   LIVESTREAM_FOLLOWUP_ATTENDEES: "live_stream_followup_attendees",
   LIVESTREAM_FOLLOWUP_NON_ATTENDEES: "live_stream_followup_non_attendees",
   APPLY_TO_JOB_LATER: "apply_to_job_later",
} as const satisfies Record<string, string>

export type CustomerIoEmailTemplateId =
   (typeof CUSTOMERIO_EMAIL_TEMPLATES)[keyof typeof CUSTOMERIO_EMAIL_TEMPLATES]

type JobData = {
   url: string
   title: string
   jobType: JobType
   businessFunctionsTags?: string
   deadline?: string
}

type SpeakerData = {
   name: string
   position: string
   avatarUrl: string
   url: string
}

type SparkData = {
   question: string
   category_id: string
   thumbnailUrl: string
   url: string
}

type CalendarData = {
   google: string
   outlook: string
   apple: string
}

/**
 * Message data for livestream registration confirmation emails
 */
export type LivestreamRegistrationTemplateData = {
   livestream: {
      title: string
      company: string
      start: string
      companyBannerImageUrl: string
   }
   jobs: JobData[]
   speakers: SpeakerData[]
   sparks: SparkData[]
   calendar: CalendarData
}

/**
 * Message data for livestream reminder email template
 */
export type ReminderTemplateData = {
   livestream: {
      company: string
      bannerImageUrl: string
      companyLogoUrl: string
      start: string
      title: string
      url: string
      companyPageUrl: string
   }
   calendar: {
      google: string
      outlook: string
      apple: string
   }
}

type ReminderFollowUpTemplateData = {
   livestream: {
      details_url: string
      company: string
      companyBannerImageUrl: string
   }
   speakers: SpeakerData[]
   jobs: JobData[]
   sparks: SparkData[]
   allowsRecording: boolean
}

type ApplicationLinkFollowUpTemplateData = {
   companyName: string
   job: JobData
}

/**
 * Union type of all possible message data types
 */
export type CustomerIoEmailMessageData = {
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REGISTRATION]: LivestreamRegistrationTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_24H]: ReminderTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_1H]: ReminderTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_5M]: ReminderTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_ATTENDEES]: ReminderFollowUpTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_FOLLOWUP_NON_ATTENDEES]: ReminderFollowUpTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.APPLY_TO_JOB_LATER]: ApplicationLinkFollowUpTemplateData
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

export type EmailNotificationRequestData<T extends CustomerIoEmailTemplateId> =
   {
      /**
       * The type of message to create
       */
      templateId: T
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
 * @param params.templateId Type of message to create
 * @param params.templateData Message data for the template
 * @param params.userAuthId User ID to send to
 * @param params.attachments Optional email attachments
 * @returns Email request options object
 */
export function createEmailNotificationRequestData<
   T extends CustomerIoEmailTemplateId
>({
   templateId,
   templateData,
   userAuthId,
   ...rest
}: EmailNotificationRequestData<T>): SendEmailRequestOptions {
   return {
      ...rest,
      transactional_message_id: templateId,
      message_data: templateData,
      identifiers: {
         id: userAuthId,
      },
   }
}

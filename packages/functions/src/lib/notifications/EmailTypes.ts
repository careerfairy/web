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
   LIVESTREAM_REMINDER_NO_SHOW: "live_stream_reminder_no_show",
   LIVESTREAM_FOLLOWUP_ATTENDEES: "live_stream_followup_attendees",
   LIVESTREAM_FOLLOWUP_NON_ATTENDEES: "live_stream_followup_non_attendees",
   APPLY_TO_JOB_LATER: "apply_to_job_later",
   WELCOME_TO_CAREERFAIRY: "welcome_to_careerfairy",
   PIN_VALIDATION: "pin_validation",
   PASSWORD_RESET: "password_reset",
   GROUP_INVITATION: "group_invitation",
   LIVE_STREAM_PUBLISH: "live_stream_publish",
   SPARKS_START_SUBSCRIPTION: "sparks_start_subscription",
   SPARKS_END_SUBSCRIPTION: "sparks_end_subscription",
   SPARKS_END_CONTENT_CREATION_PERIOD: "sparks_end_content_creation_period",
   LIVE_STREAM_REGISTRATION_F2F: "live_stream_registration_confirmation_f2f",
} as const satisfies Record<string, string>

export type CustomerIoEmailTemplateId =
   (typeof CUSTOMERIO_EMAIL_TEMPLATES)[keyof typeof CUSTOMERIO_EMAIL_TEMPLATES]

export type JobData = {
   url: string
   title: string
   jobType: JobType
   businessFunctionsTags: string
   deadline: string
}

export type SpeakerData = {
   name: string
   position: string
   avatarUrl: string
   url: string
   linkedInUrl: string
}

export type SparkData = {
   question: string
   category_id: string
   thumbnailUrl: string
   url: string
}

export type CalendarData = {
   google: string
   outlook: string
   apple: string
}

type BaseLivestreamData = {
   title: string
   company: string
   companyLogoUrl: string
   url: string
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

export type LivestreamRegistrationF2FTemplateData = {
   livestream: {
      title: string
      company: string
      start: string
      companyBannerImageUrl: string
      eventAddress: string
   }
   jobs: JobData[]
   speakers: SpeakerData[]
   sparks: SparkData[]
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

export type NoShowReminderTemplateData = {
   livestream: BaseLivestreamData
   speaker1: {
      firstName: string
   }
   speaker2: {
      firstName: string
   }
}

/**
 * Message data for livestream reminder follow up email template
 */
export type ReminderFollowUpTemplateData = {
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

/**
 * Message data for application link follow up email template
 */
export type ApplicationLinkFollowUpTemplateData = {
   companyName: string
   job: JobData
}

/**
 * Message data for pin validation email template
 */
export type PinValidationTemplateData = {
   pinCode: string
}

/**
 * Reset url for password reset email template
 */
export type PasswordResetTemplateData = {
   action_url: string
}

/**
 * Message data for group invitation email template
 */
export type GroupInvitationTemplateData = {
   group_link: string
   group_name: string
   invite_link: string
   sender_first_name: string
}

/**
 * Message data for livestream published email template
 */
export type LivestreamPublishedTemplateData = {
   livestream: BaseLivestreamData & {
      companyBannerImageUrl: string
   }
   dashboardUrl: string
}

export type SparksPlanTemplateData = {
   company_name: string
   company_plan: string
   company_sparks_link: string
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
   [CUSTOMERIO_EMAIL_TEMPLATES.WELCOME_TO_CAREERFAIRY]: null
   [CUSTOMERIO_EMAIL_TEMPLATES.PIN_VALIDATION]: PinValidationTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.PASSWORD_RESET]: PasswordResetTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.GROUP_INVITATION]: GroupInvitationTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVESTREAM_REMINDER_NO_SHOW]: NoShowReminderTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_PUBLISH]: LivestreamPublishedTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_START_SUBSCRIPTION]: SparksPlanTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION]: SparksPlanTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_CONTENT_CREATION_PERIOD]: SparksPlanTemplateData
   [CUSTOMERIO_EMAIL_TEMPLATES.LIVE_STREAM_REGISTRATION_F2F]: LivestreamRegistrationF2FTemplateData
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
       * Optional attachments for the email.
       * Each attachment should have a filename and content.
       * Content can be provided as either a Buffer or a string.
       * All content will be automatically encoded to base64 before sending.
       */
      attachments?: EmailAttachment[]
   } & Omit<
      SendEmailRequestOptions,
      "transactional_message_id" | "message_data"
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
   ...rest
}: EmailNotificationRequestData<T>): SendEmailRequestOptions {
   return {
      ...rest,
      transactional_message_id: templateId,
      message_data: templateData,
   }
}

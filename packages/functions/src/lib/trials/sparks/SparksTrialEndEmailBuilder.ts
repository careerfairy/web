import { Logger } from "@careerfairy/shared-lib/utils/types"
import {
   CUSTOMERIO_EMAIL_TEMPLATES,
   EmailNotificationRequestData,
} from "../../notifications/EmailTypes"
import { INotificationService } from "../../notifications/NotificationService"
import { SparksEndOfTrialTemplateModel } from "../trialEnd"

export type SparksEndOfTrialData = SparksEndOfTrialTemplateModel & {
   userEmail: string
}

type TemplateData = EmailNotificationRequestData<
   typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION
>

/**
 * Builds a Sparks end of trial email and sends it to the recipients using Customer.io
 */
export class SparkTrialEndEmailBuilder {
   private messages: TemplateData[] = []

   constructor(
      private readonly notificationService: INotificationService,
      private readonly logger: Logger
   ) {}

   /**
    * Adds a recipient to the list of messages
    */
   addRecipient(data: SparksEndOfTrialData): SparkTrialEndEmailBuilder {
      // We need to adapt our check since the structure changed
      const duplicateMessage = (
         m: EmailNotificationRequestData<
            typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION
         >
      ) =>
         m.to === data.userEmail &&
         m.templateData.company_sparks_link === data.company_sparks_link

      // double check for not sending duplicates even though should not be needed here
      if (this.messages.find(duplicateMessage)) return this

      this.logger.info("SparkTrialEndEmailBuilder ~ adding:", data)

      this.messages.push({
         templateId: CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION,
         to: data.userEmail,
         identifiers: {
            email: data.userEmail,
         },
         templateData: {
            company_name: data.groupName,
            company_plan: data.planType,
            company_sparks_link: data.company_sparks_link,
         },
      })

      return this
   }

   /**
    * Adds multiple recipients to the list by calling @method addRecipient for each data in @param dataItems
    */
   addRecipients(dataItems: SparksEndOfTrialData[]): SparkTrialEndEmailBuilder {
      dataItems.forEach((data) => this.addRecipient(data))
      return this
   }

   /**
    * Send the Customer.io email for the stored messages
    */
   async send(): Promise<void> {
      if (!this.messages.length) {
         return null
      }

      try {
         const result = await this.notificationService.sendEmailNotifications(
            this.messages
         )

         this.logger.info(
            `Completed sending end of sparks trial emails: ${result.successful} successful, ${result.failed} failed`
         )
      } catch (error) {
         this.logger.error(
            "Unable to send end of sparks trial emails via Customer.io",
            { error }
         )
      } finally {
         // Clear items, allowing the object be reused
         this.messages = []
      }
   }

   getRecipients(): EmailNotificationRequestData<
      typeof CUSTOMERIO_EMAIL_TEMPLATES.SPARKS_END_SUBSCRIPTION
   >[] {
      return this.messages
   }
}

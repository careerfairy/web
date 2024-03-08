import { Logger } from "@careerfairy/shared-lib/utils/types"
import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "src/api/postmark"
import { SparksEndOfTrialTag, SparksEndOfTrialTemplateModel } from "../trialEnd"

type EnfOfTrialTemplateData<
   TemplateModelType,
   Tag extends SparksEndOfTrialTag
> = {
   From: string
   To: string
   TemplateId: number
   TemplateModel: TemplateModelType
   MessageStream: string
   Tag: Tag
}

type SparksEnfOfTrialTemplateData = EnfOfTrialTemplateData<
   SparksEndOfTrialTemplateModel,
   "sparks-end-of-trial"
>

export type SparksEndOfTrialData = SparksEndOfTrialTemplateModel & {
   userEmail: string
}

const FROM = "CareerFairy <noreply@careerfairy.io>"
/**
 * Builds an Onboarding newsletter email (templated) and each batch, according to its type, to the various recipients
 */
export class SparkTrialEndEmailBuilder {
   private messages: TemplatedMessage[] = []

   constructor(
      private readonly sender: PostmarkEmailSender,
      private readonly logger: Logger
   ) {}

   private getEndOfTrialTemplate(
      model: SparksEndOfTrialData
   ): SparksEnfOfTrialTemplateData {
      return {
         From: FROM,
         To: model.userEmail,
         TemplateId: Number(process.env.POSTMARK_TEMPLATE_TRIAL_END_SPARKS),
         TemplateModel: model,
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "sparks-end-of-trial",
      }
   }

   /**
    * Adds a recipient to the list of messages
    */
   addRecipient(data: SparksEndOfTrialData): SparkTrialEndEmailBuilder {
      // double check for not sending duplicates even though should not be needed here
      if (
         this.messages.find(
            (m: SparksEnfOfTrialTemplateData) =>
               m.To == data.userEmail && m.TemplateModel.groupId == data.groupId
         )
      )
         return this
      this.logger.info("SparkTrialEndEmailBuilder ~ adding:", data)
      this.messages.push(this.getEndOfTrialTemplate(data))
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
    * Send the postmark email for the stored messages
    */
   send(): Promise<void[]> {
      if (!this.messages.length) {
         return null
      }

      return this.sender
         .sendEmailBatchWithTemplates(this.messages, (err) => {
            if (err) {
               this.logger.info(
                  "error sending end of sparks trial emails:",
                  err,
                  this.messages
               )
               this.logger.error(
                  "Unable to send end of sparks trial emails via postmark",
                  {
                     error: err,
                  }
               )
               return
            }
         })
         .finally(() => {
            // Clear items, allowing the object be reused
            this.messages = []
         })
   }

   getRecipients(): TemplatedMessage[] {
      return this.messages
   }
}

import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../api/postmark"
import { Logger } from "@careerfairy/shared-lib/utils/types"

/**
 * Builds a Spark release email (templated) and sends it to the recipients
 */
export class SparkReleaseEmailBuilder {
   private readonly from = "CareerFairy <noreply@careerfairy.io>"
   private recipients: TemplatedMessage[] = []

   constructor(
      private readonly sender: PostmarkEmailSender,
      private readonly logger: Logger
   ) {}

   /**
    * Adds a recipient to the list of recipients and constructs the template data
    */
   addRecipient(email: string, name: string) {
      this.recipients.push({
         From: this.from,
         To: email,
         TemplateId: Number(process.env.POSTMARK_TEMPLATE_SPARKS_RELEASE),
         TemplateModel: {
            name,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "sparks-release",
      })
   }

   send() {
      // TODO: Confirm why err as first parameter does not work, err seems to always be null
      return this.sender.sendEmailBatchWithTemplates(
         this.recipients,
         (err, res) => {
            if (err || (res.length && res.at(0).ErrorCode)) {
               this.logger.error("Unable to send via postmark ", {
                  error: err,
                  res: res,
               })
               return
            }
         }
      )
   }
}

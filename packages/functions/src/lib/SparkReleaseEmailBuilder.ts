import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../api/postmark"

/**
 * Builds a Spark release email (templated) and sends it to the recipients
 */
export class SparkReleaseEmailBuilder {
   private readonly from = "CareerFairy <noreply@careerfairy.io>"
   private recipients: TemplatedMessage[] = []

   constructor(private readonly sender: PostmarkEmailSender) {}

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
      return this.sender.sendEmailBatchWithTemplates(this.recipients, (err) => {
         // this callback is called for each postmark http response
         if (err) {
            console.error("Unable to send via postmark", {
               error: err,
            })
            return
         }
      })
   }
}

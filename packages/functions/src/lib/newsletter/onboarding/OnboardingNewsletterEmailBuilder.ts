import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../../../api/postmark"
import { UserData } from "@careerfairy/shared-lib/users"

enum OnboardingNewsletterEvents {
   COMPANY_DISCOVERY,
   SPARKS_DISCOVERY,
   LIVESTREAM_1ST_REGISTRATION_DISCOVERY,
   RECORDING_DISCOVERY,
   FEEDBACK_DISCOVERY,
}
/**
 * Builds an Onboarding newsletter email (templated) and each batch, according to its type, to the various recipients
 */
export class OnboardingNewsletterEmailBuilder {
   private readonly from = "CareerFairy <noreply@careerfairy.io>"

   private companyDiscoveryRecipients: TemplatedMessage[] = []
   private sparksDiscoveryRecipients: TemplatedMessage[] = []
   private livestream1stRegistrationDiscoveryRecipients: TemplatedMessage[] = []
   private recordingDiscoveryRecipients: TemplatedMessage[] = []
   private feedbackDiscoveryRecipients: TemplatedMessage[] = []

   private discoveryEmailsTemplatedMessageMap = new Map<
      OnboardingNewsletterEvents,
      TemplatedMessage[]
   >()

   constructor(private readonly sender: PostmarkEmailSender) {
      this.initRecipientsData()
   }

   private initRecipientsData() {
      this.discoveryEmailsTemplatedMessageMap.set(
         OnboardingNewsletterEvents.COMPANY_DISCOVERY,
         this.companyDiscoveryRecipients
      )
      this.discoveryEmailsTemplatedMessageMap.set(
         OnboardingNewsletterEvents.SPARKS_DISCOVERY,
         this.sparksDiscoveryRecipients
      )
      this.discoveryEmailsTemplatedMessageMap.set(
         OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY,
         this.livestream1stRegistrationDiscoveryRecipients
      )
      this.discoveryEmailsTemplatedMessageMap.set(
         OnboardingNewsletterEvents.RECORDING_DISCOVERY,
         this.recordingDiscoveryRecipients
      )
      this.discoveryEmailsTemplatedMessageMap.set(
         OnboardingNewsletterEvents.FEEDBACK_DISCOVERY,
         this.feedbackDiscoveryRecipients
      )
   }

   private getTemplateModel(
      type: OnboardingNewsletterEvents,
      userData: UserData
   ): TemplatedMessage {
      const template = {
         From: this.from,
         To: userData.userEmail,
         TemplateId: Number(process.env.POSTMARK_TEMPLATE_NEWSLETTER),
         TemplateModel: {
            name: "templateName",
            // header1,
            // header2,
            // livestreams1,
            // livestreams2,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
      return template
   }
   /**
    * Adds a recipient to the list of recipients and constructs the template data
    */
   addRecipient(
      userData: UserData,
      discoveryType: OnboardingNewsletterEvents
   ): OnboardingNewsletterEmailBuilder {
      const template = this.getTemplateModel(discoveryType, userData)
      this.discoveryEmailsTemplatedMessageMap.get(discoveryType).push(template)
      return this
   }

   addRecipients(
      usersData: UserData[],
      discoveryType: OnboardingNewsletterEvents
   ): OnboardingNewsletterEmailBuilder {
      usersData.forEach((data) => this.addRecipient(data, discoveryType))
      return this
   }

   send(discoveryType: OnboardingNewsletterEvents): Promise<void[]> {
      return this.sender.sendEmailBatchWithTemplates(
         this.discoveryEmailsTemplatedMessageMap.get(discoveryType),
         (err) => {
            // this callback is called for each postmark http response
            if (err) {
               console.error("Unable to send via postmark", {
                  error: err,
               })
               return
            }
         }
      )
   }

   sendAll(): Promise<void[][]> {
      return Promise.all([
         this.send(OnboardingNewsletterEvents.COMPANY_DISCOVERY),
         this.send(OnboardingNewsletterEvents.SPARKS_DISCOVERY),
         this.send(
            OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         ),
         this.send(OnboardingNewsletterEvents.RECORDING_DISCOVERY),
         this.send(OnboardingNewsletterEvents.FEEDBACK_DISCOVERY),
      ])
   }
}

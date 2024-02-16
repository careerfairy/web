import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../../../api/postmark"
import { UserData } from "@careerfairy/shared-lib/users"

export enum OnboardingNewsletterEvents {
   COMPANY_DISCOVERY = "companyDiscovery",
   SPARKS_DISCOVERY = "sparksDiscovery",
   LIVESTREAM_1ST_REGISTRATION_DISCOVERY = "livestream1stRegistrationDiscovery",
   RECORDING_DISCOVERY = "recordingDiscovery",
   FEEDBACK_DISCOVERY = "feedbackDiscovery",
}

type DiscoveryTemplateData = {
   TemplateId: number
   TemplateModel: any
   MessageStream: string
   Tag: string
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

   private discoveryTemplateModelConvertersMap = new Map<
      OnboardingNewsletterEvents,
      (user: UserData) => DiscoveryTemplateData
   >()

   constructor(private readonly sender: PostmarkEmailSender) {
      this.initRecipientsData()
      this.initConvertersMap()
   }

   private initConvertersMap() {
      this.discoveryTemplateModelConvertersMap.set(
         OnboardingNewsletterEvents.COMPANY_DISCOVERY,
         this.companyDiscoveryTemplateData
      )
      this.discoveryTemplateModelConvertersMap.set(
         OnboardingNewsletterEvents.SPARKS_DISCOVERY,
         this.sparksDiscoveryTemplateData
      )
      this.discoveryTemplateModelConvertersMap.set(
         OnboardingNewsletterEvents.LIVESTREAM_1ST_REGISTRATION_DISCOVERY,
         this.livestream1stRegistrationDiscoveryTemplateData
      )
      this.discoveryTemplateModelConvertersMap.set(
         OnboardingNewsletterEvents.RECORDING_DISCOVERY,
         this.recordingDiscoveryTemplateData
      )
      this.discoveryTemplateModelConvertersMap.set(
         OnboardingNewsletterEvents.FEEDBACK_DISCOVERY,
         this.feedbackDiscoveryTemplateData
      )
   }

   private companyDiscoveryTemplateData(user: UserData): DiscoveryTemplateData {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_COMPANY_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
   }
   private sparksDiscoveryTemplateData(user: UserData): DiscoveryTemplateData {
      return {
         TemplateId: Number(
            process.env.POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_SPARKS_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
   }
   private livestream1stRegistrationDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
   }
   private recordingDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_RECORDING_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
   }
   private feedbackDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_FEEDBACK_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "newsletter",
      }
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
      const templateData =
         this.discoveryTemplateModelConvertersMap.get(type)(userData)
      return {
         From: this.from,
         To: userData.userEmail,
         TemplateId: templateData.TemplateId,
         TemplateModel: templateData.TemplateModel,
         MessageStream: templateData.MessageStream,
         Tag: templateData.Tag,
      }
   }

   getTemplate(discoveryType: OnboardingNewsletterEvents): TemplatedMessage[] {
      return this.discoveryEmailsTemplatedMessageMap.get(discoveryType)
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
      console.log(
         "🚀 ~ OnboardingNewsletterEmailBuilder ~ send ~ discoveryType:",
         discoveryType
      )
      const messages =
         this.discoveryEmailsTemplatedMessageMap.get(discoveryType)
      console.log(
         "🚀 ~ OnboardingNewsletterEmailBuilder ~ send ~ ~ ~ ~messagesTo:",
         messages.map((t) => t.To)
      )

      if (!messages.length) {
         return null
      }

      return (
         messages.length &&
         this.sender.sendEmailBatchWithTemplates(messages, (err) => {
            // this callback is called for each postmark http response
            if (err) {
               console.error("Unable to send via postmark", {
                  error: err,
               })
               return
            }
         })
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

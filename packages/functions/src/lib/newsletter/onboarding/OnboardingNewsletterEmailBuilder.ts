import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../../../api/postmark"
import { UserData } from "@careerfairy/shared-lib/users"
import {
   CompanyDiscoveryTemplateModel,
   DiscoveryTag,
   FeedbackDiscoveryTemplateModel,
   LivestreamDiscoveryTemplateModel,
   RecordingDiscoveryTemplateModel,
   SparksDiscoveryTemplateModel,
} from "./onboarding"

export enum OnboardingNewsletterEvents {
   COMPANY_DISCOVERY = "companyDiscovery",
   SPARKS_DISCOVERY = "sparksDiscovery",
   LIVESTREAM_1ST_REGISTRATION_DISCOVERY = "livestream1stRegistrationDiscovery",
   RECORDING_DISCOVERY = "recordingDiscovery",
   FEEDBACK_DISCOVERY = "feedbackDiscovery",
}

type DiscoveryTemplateData<TemplateModelType, Tag extends DiscoveryTag> = {
   TemplateId: number
   TemplateModel: TemplateModelType
   MessageStream: string
   Tag: Tag
}

type CompanyDiscoveryData = DiscoveryTemplateData<
   CompanyDiscoveryTemplateModel,
   "onboarding-company"
>
type SparksDiscoveryData = DiscoveryTemplateData<
   SparksDiscoveryTemplateModel,
   "onboarding-sparks"
>
export type LivestreamDiscoveryData = DiscoveryTemplateData<
   LivestreamDiscoveryTemplateModel,
   "onboarding-livestream"
>
type RecordingDiscoveryData = DiscoveryTemplateData<
   RecordingDiscoveryTemplateModel,
   "onboarding-recording"
>
type FeedbackDiscoveryData = DiscoveryTemplateData<
   FeedbackDiscoveryTemplateModel,
   "onboarding-feedback"
>

type AllDiscoveryData =
   | CompanyDiscoveryData
   | SparksDiscoveryData
   | LivestreamDiscoveryData
   | RecordingDiscoveryData
   | FeedbackDiscoveryData

type DiscoveryMapper = (user: UserData) => AllDiscoveryData

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
      DiscoveryMapper
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

   private companyDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData<
      CompanyDiscoveryTemplateModel,
      "onboarding-company"
   > {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_COMPANY_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-company",
      }
   }

   private sparksDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData<SparksDiscoveryTemplateModel, "onboarding-sparks"> {
      return {
         TemplateId: Number(
            process.env.POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_SPARKS_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-sparks",
      }
   }

   private livestream1stRegistrationDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData<
      LivestreamDiscoveryTemplateModel,
      "onboarding-livestream"
   > {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_LIVESTREAM_1ST_REGISTRATION_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-livestream",
      }
   }

   private recordingDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData<
      CompanyDiscoveryTemplateModel,
      "onboarding-recording"
   > {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_RECORDING_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-recording",
      }
   }

   private feedbackDiscoveryTemplateData(
      user: UserData
   ): DiscoveryTemplateData<
      FeedbackDiscoveryTemplateModel,
      "onboarding-feedback"
   > {
      return {
         TemplateId: Number(
            process.env
               .POSTMARK_TEMPLATE_ONBOARDING_NEWSLETTER_FEEDBACK_DISCOVERY
         ),
         TemplateModel: {
            user_name: user.firstName,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
         Tag: "onboarding-feedback",
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

   /**
    * Allows overriding of discovery mappers, if mapping is already it is replaced.
    * @param discoveryType Type of discovery
    * @param mapper Function for mapping users to templates
    */
   setDiscoveryMapper(
      discoveryType: OnboardingNewsletterEvents,
      mapper: DiscoveryMapper
   ) {
      this.discoveryTemplateModelConvertersMap.set(discoveryType, mapper)
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
      return this.addRecipientTemplated(discoveryType, template)
   }

   /**
    * Adds multiple recipients to the list by calling @method addRecipient for each user in @param usersData
    */
   addRecipients(
      usersData: UserData[],
      discoveryType: OnboardingNewsletterEvents
   ): OnboardingNewsletterEmailBuilder {
      usersData.forEach((data) => this.addRecipient(data, discoveryType))
      return this
   }

   /**
    * Adds a recipient to the list of recipients and based on the templated data
    */
   addRecipientTemplated(
      discoveryType: OnboardingNewsletterEvents,
      template: TemplatedMessage
   ): OnboardingNewsletterEmailBuilder {
      this.discoveryEmailsTemplatedMessageMap.get(discoveryType).push(template)
      return this
   }

   /**
    * Send the postmark email for a specific discovery type, the stored templates are retrieved
    * based on the type as well
    * @param discoveryType Type of discovery to send emails
    */
   send(discoveryType: OnboardingNewsletterEvents): Promise<void[]> {
      console.log(
         "OnboardingNewsletterEmailBuilder ~ send ~ discoveryType:",
         discoveryType
      )
      const messages =
         this.discoveryEmailsTemplatedMessageMap.get(discoveryType)
      console.log(
         "OnboardingNewsletterEmailBuilder ~ send ~ ~ ~ ~messagesTo:",
         messages.map((t) => t.To)
      )

      if (!messages.length) {
         console.log(
            "OnboardingNewsletterEmailBuilder ~ send ~ ~empty messages - IGNORE:",
            messages.map((t) => t.To)
         )
         return null
      }

      return this.sender.sendEmailBatchWithTemplates(messages, (err, res) => {
         if (err) {
            console.log(
               "OnboardingNewsletterEmailBuilder ~ send ~ ~ ~ ~ error:",
               err,
               messages
            )
            console.error("Unable to send Discovery Email via postmark", {
               error: err,
            })
            return
         }
         console.log(
            "OnboardingNewsletterEmailBuilder ~ SEND_OK: ",
            res.map((res) => res.To)
         )
      })
   }

   /**
    * Batches all calls to send for all the discoveries and returns a promise fulfilling when all are done.
    * @returns
    */
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

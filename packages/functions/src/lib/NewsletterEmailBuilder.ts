import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   addUtmTagsToLink,
   getSubstringWithEllipsis,
} from "@careerfairy/shared-lib/utils"
import { TemplatedMessage } from "postmark"
import { PostmarkEmailSender } from "../api/postmark"
import { DateTime } from "luxon"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/utils/urls"

/**
 * Builds a newsletter email (templated) and sends it to the recipients
 */
export class NewsletterEmailBuilder {
   private readonly from = "CareerFairy <noreply@careerfairy.io>"
   private recipients: TemplatedMessage[] = []

   constructor(private readonly sender: PostmarkEmailSender) {}

   /**
    * Adds a recipient to the list of recipients and constructs the template data
    */
   addRecipient(
      email: string,
      name: string,
      followingLivestreams: LivestreamEvent[],
      recommendedLivestreams: LivestreamEvent[]
   ) {
      let header1 = "Live streams from your followed companies:"
      const header2 = "Live streams recommended for you:"

      const follow = followingLivestreams
         ?.slice(0, 5)
         ?.map(this.mapLivestreamToTemplate)

      const recommended = recommendedLivestreams
         ?.slice(0, 3)
         ?.map(this.mapLivestreamToTemplate)
         .map((l) => {
            l.title = getSubstringWithEllipsis(l.title, 60)
            return l
         })

      let livestreams1 = follow // rows
      let livestreams2 = recommended // bottom columns

      // hide the recommended events when displaying more than 3 follow events
      if (follow?.length > 3) {
         livestreams2 = []
      }

      // no follow events, display the recommended events in the rows horizontally
      if (follow?.length === 0) {
         header1 = header2 // header2 will be hidden
         livestreams1 = recommended
         livestreams2 = []
      }

      this.recipients.push({
         From: this.from,
         To: email,
         TemplateId: Number(process.env.POSTMARK_TEMPLATE_NEWSLETTER),
         TemplateModel: {
            name,
            header1,
            header2,
            livestreams1,
            livestreams2,
         },
         MessageStream: process.env.POSTMARK_BROADCAST_STREAM,
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

   private mapLivestreamToTemplate(livestream: LivestreamEvent) {
      const link = makeLivestreamEventDetailsUrl(livestream.id)
      const date = DateTime.fromJSDate(livestream.start.toDate())

      return {
         image: livestream.companyLogoUrl,
         title: livestream.title,
         date: date.toFormat("dd LLLL yyyy"),
         description: getSubstringWithEllipsis(livestream.summary, 300),
         link: addUtmTagsToLink({
            link,
            campaign: "newsletter",
         }),
      }
   }
}

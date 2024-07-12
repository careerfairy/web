import { BaseModel } from "@careerfairy/shared-lib/BaseModel"
import { FieldOfStudy } from "@careerfairy/shared-lib/marketing/MarketingUser"
import {
   HygraphResponseCompanyLogosValue,
   HygraphResponseCompanyValues,
   HygraphResponseEventsSection,
   HygraphResponseHero,
   HygraphResponseHighlightList,
   HygraphResponseMarketingPage,
   HygraphResponseMarketingSignup,
   HygraphResponseSeo,
   HygraphResponseTestimonialListValue,
   HygraphResponseTestimonialValue,
   HygraphResponseTextBlock,
} from "../../types/cmsTypes"

export class MarketingLandingPage extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly fieldsOfStudy: FieldOfStudy[],
      public readonly seo: HygraphResponseSeo,
      public readonly blocks: (
         | HygraphResponseEventsSection
         | HygraphResponseMarketingSignup
         | HygraphResponseHero
         | HygraphResponseCompanyValues
         | HygraphResponseTestimonialValue
         | HygraphResponseTestimonialListValue
         | HygraphResponseCompanyLogosValue
         | HygraphResponseTextBlock
         | HygraphResponseHighlightList
      )[]
   ) {
      super()
   }

   static createFromHygraph(page: HygraphResponseMarketingPage) {
      return new MarketingLandingPage(
         page.id,
         page.slug,
         page.fieldOfStudies.map((o) => ({
            id: o.fieldOfStudyId,
            name: o.fieldOfStudyName,
         })), // get the remote field of study from firebase
         page.seo,
         page.blocks
      )
   }
   static createFromPlainObject(page: MarketingLandingPage) {
      return new MarketingLandingPage(
         page.id,
         page.slug,
         page.fieldsOfStudy,
         page.seo,
         page.blocks
      )
   }
}

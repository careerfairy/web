import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponseCompanyValues,
   HygraphResponseEventsSection,
   HygraphResponseHero,
   HygraphResponseMarketingPage,
   HygraphResponseMarketingSignup,
   HygraphResponseSeo,
} from "../../types/cmsTypes"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"

export class MarketingLandingPage extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly title: string,
      public readonly subtitle: string,
      public readonly fieldsOfStudy: FieldOfStudy[],
      public readonly seo: HygraphResponseSeo,
      public readonly blocks: (
         | HygraphResponseEventsSection
         | HygraphResponseMarketingSignup
         | HygraphResponseHero
         | HygraphResponseCompanyValues
      )[]
   ) {
      super()
   }

   static createFromHygraph(page: HygraphResponseMarketingPage) {
      return new MarketingLandingPage(
         page.id,
         page.slug,
         page.title,
         page.subtitle,
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
         page.title,
         page.subtitle,
         page.fieldsOfStudy,
         page.seo,
         page.blocks
      )
   }
}

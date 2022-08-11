import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponseEventsSection,
   HygraphResponseHero,
   HygraphResponseMarketingPage,
   HygraphResponseMarketingSignup,
   HygraphResponseSeo,
} from "../../types/cmsTypes"

export class MarketingLandingPage extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly title: string,
      public readonly subtitle: string,
      public readonly hero: HygraphResponseHero,
      public readonly seo: HygraphResponseSeo,
      public readonly blocks: (
         | HygraphResponseEventsSection
         | HygraphResponseMarketingSignup
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
         page.hero,
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
         page.hero,
         page.seo,
         page.blocks
      )
   }
}

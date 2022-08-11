import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphHero,
   HygraphMarketingPage,
   HygraphSeo,
} from "../../types/cmsTypes"

export class MarketingLandingPage extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly title: string,
      public readonly subtitle: string,
      public readonly hero: HygraphHero,
      public readonly seo: HygraphSeo
   ) {
      super()
   }

   static createFromHygraph(page: HygraphMarketingPage) {
      return new MarketingLandingPage(
         page.id,
         page.title,
         page.subtitle,
         page.hero,
         page.seo
      )
   }
   static createFromPlainObject(page: MarketingLandingPage) {
      return new MarketingLandingPage(
         page.id,
         page.title,
         page.subtitle,
         page.hero,
         page.seo
      )
   }
}

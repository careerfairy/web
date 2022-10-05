import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponseMarketingPage,
   HygraphResponseMarketingPageBlock,
   HygraphResponseSeo,
} from "../../types/cmsTypes"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/marketing/MarketingUser"

export class MarketingLandingPage extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly fieldsOfStudy: FieldOfStudy[],
      public readonly seo: HygraphResponseSeo, // TODO: convert the response type into a business model
      public readonly blocks: HygraphResponseMarketingPageBlock[] // TODO: convert the response types into a business model
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

import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponsePage,
   HygraphResponsePageBlock,
   HygraphResponseSeo,
   PageTypes,
} from "../../types/cmsTypes"

export class Page extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly seo: HygraphResponseSeo,
      public readonly blocks: HygraphResponsePageBlock[],
      public readonly pageType: PageTypes
   ) {
      super()
   }

   static createFromHygraph(page: HygraphResponsePage) {
      return new Page(page.id, page.slug, page.seo, page.blocks, page.pageType)
   }
   static createFromPlainObject(page: Page) {
      return new Page(page.id, page.slug, page.seo, page.blocks, page.pageType)
   }
}

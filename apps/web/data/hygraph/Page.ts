import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponsePage,
   HygraphResponseSeo,
   PageTypes,
} from "../../types/cmsTypes"
import { parseBlocksMdx } from "./util"

export class Page extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly seo: HygraphResponseSeo,
      public readonly blocks: Awaited<ReturnType<typeof parseBlocksMdx>>,
      public readonly pageType: PageTypes
   ) {
      super()
   }

   static async createFromHygraph(page: HygraphResponsePage) {
      return new Page(
         page.id,
         page.slug,
         page.seo,
         await parseBlocksMdx(page.blocks),
         page.pageType
      )
   }
   static createFromPlainObject(page: Page) {
      return new Page(page.id, page.slug, page.seo, page.blocks, page.pageType)
   }
}

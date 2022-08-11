import { BaseModel } from "@careerfairy/shared-lib/dist/BaseModel"
import {
   HygraphResponsePage,
   HygraphResponseSeo,
   ICmsImage,
} from "../../types/cmsTypes"

export class Page extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly slug: string,
      public readonly title: string,
      public readonly subtitle: string,
      public readonly seo: HygraphResponseSeo,
      public readonly image: ICmsImage
   ) {
      super()
   }

   static createFromHygraph(page: HygraphResponsePage) {
      return new Page(
         page.id,
         page.slug,
         page.title,
         page.subtitle,
         page.seo,
         page.image
      )
   }
   static createFromPlainObject(page: Page) {
      return new Page(
         page.id,
         page.slug,
         page.title,
         page.subtitle,
         page.seo,
         page.image
      )
   }
}

import { SeoProps } from "components/util/SEO"
import { Page, TalentGuideModule } from "data/hygraph/types"

export const getTalentGuideLevelSeoProps = (
   data: Page<TalentGuideModule>
): Partial<SeoProps> => {
   return {
      title: data.seo?.title,
      description: data.seo?.description,
      image: data.seo?.image,
      keywords: data.seo?.keywords,
      noIndex: data.seo?.noIndex,
      openGraph: {
         title: data.seo?.title,
         description: data.seo?.description,
         type: "article",
         article: {
            section: data.content?.category,
            tags: [
               ...(data.content?.contentTopicTags || []),
               ...(data.content?.businessFunctionTags || []),
            ],
         },
      },
      twitter: {
         cardType: "summary_large_image",
      },
      additionalMetaTags: [
         {
            name: "duration",
            content: `${data.content?.estimatedModuleDurationMinutes} minutes`,
         },
         {
            name: "level",
            content: data.content?.level?.toString(),
         },
      ],
   }
}

export const getTalentGuideOverviewSeoProps = (
   rootPage: Page<TalentGuideModule>,
   pages: Page<TalentGuideModule>[]
): Partial<SeoProps> => {
   const totalModules = pages.length
   const categories = [
      ...new Set(pages.map((page) => page.content?.category).filter(Boolean)),
   ]
   const description = rootPage.seo?.description

   return {
      title: rootPage.seo?.title,
      description,
      image: rootPage.seo?.image,
      keywords: rootPage.seo?.keywords,
      noIndex: rootPage.seo?.noIndex,
      openGraph: {
         title: rootPage.seo?.title,
         description,
         type: "website",
         article: {
            section: "Education",
            tags: categories,
         },
      },
      twitter: {
         cardType: "summary_large_image",
      },
      additionalMetaTags: [
         {
            name: "modules-count",
            content: totalModules.toString(),
         },
         {
            name: "categories",
            content: categories.join(", "),
         },
      ],
   }
}

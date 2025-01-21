import { SeoProps } from "components/util/SEO"
import { Page, TalentGuideModule } from "data/hygraph/types"

export const getTalentGuideModuleSeoProps = (
   data: Page<TalentGuideModule>
): Partial<SeoProps> => {
   return {
      title: `${data.content?.moduleName} - CareerFairy Levels`,
      description: data.content?.moduleDescription,
      image: {
         url: data.content?.moduleIllustration?.url,
         width: data.content?.moduleIllustration?.width,
         height: data.content?.moduleIllustration?.height,
         alt:
            data.content?.moduleIllustration?.alt ||
            `${data.content?.moduleName} illustration`,
      },
      openGraph: {
         title: data.content?.moduleName,
         description: data.content?.moduleDescription,
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

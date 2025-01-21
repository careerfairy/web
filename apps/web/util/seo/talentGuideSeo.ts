import { SeoProps } from "components/util/SEO"
import { ILLUSTRATION_URL } from "components/views/levels/components/course-overview/CourseIllustration"
import { Page, TalentGuideModule } from "data/hygraph/types"

export const getTalentGuideModuleSeoProps = (
   data: Page<TalentGuideModule>,
   isPreview: boolean
): Partial<SeoProps> => {
   return {
      title: `${data.content?.moduleName} - CareerFairy Levels`,
      description: data.content?.moduleDescription,
      noIndex: isPreview,
      image: {
         url: data.content?.moduleIllustration?.url,
         width: data.content?.moduleIllustration?.width,
         height: data.content?.moduleIllustration?.height,
         alt:
            data.content?.moduleIllustration?.alt ||
            `${data.content?.moduleName} illustration`,
      },
      openGraph: {
         title: `${data.content?.moduleName} - CareerFairy Levels`,
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

export const getTalentGuideOverviewSeoProps = (
   pages: Page<TalentGuideModule>[],
   isPreview: boolean
): Partial<SeoProps> => {
   const totalModules = pages.length
   const categories = [
      ...new Set(pages.map((page) => page.content?.category).filter(Boolean)),
   ]
   const description =
      "Enhance your job search journey with expert-curated learning modules. Get in-depth insights, company perspectives, and practical guidance tailored to each stage of your career development."

   return {
      title: "CareerFairy | Levels",
      description,
      noIndex: isPreview,
      image: {
         url: ILLUSTRATION_URL,
         alt: "CareerFairy Levels Overview",
      },
      openGraph: {
         title: "CareerFairy Levels - Career Development Modules",
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

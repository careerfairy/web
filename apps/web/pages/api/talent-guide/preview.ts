import { tgPreviewService } from "data/hygraph/TalentGuideService"
import { PageType } from "data/hygraph/types"
import { NextApiRequest, NextApiResponse } from "next"
/*
 * You can read more about preview mode on [nextjs](https://nextjs.org/docs/advanced-features/preview-mode)
 *
 * Snippet:
 * Static Generation is useful when your pages fetch data from a headless CMS.
 * However, it’s not ideal when you’re writing a draft on your headless CMS and
 * want to preview the draft immediately on your page. You’d want Next.js to render
 * these pages at request time instead of build time and fetch the draft content
 * instead of the published content. You’d want Next.js to bypass Static Generation
 * only for this specific case.
 *
 * Next.js has a feature called Preview Mode which solves this problem. Here are instructions on how to use it.
 * */
export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   // Check the secret and next parameters
   // This secret should only be known to this API route and the CMS
   if (
      req.query.secret !== process.env.HYGRAPH_TALENT_GUIDE_PREVIEW_SECRET ||
      !req.query.slug
   ) {
      return res.status(401).json({ message: "Invalid token" })
   }

   // Fetch the headless CMS to check if the provided `slug` exists
   const { location, hasData } = await getPreviewData(req.query)

   // If the content doesn't exist prevent preview mode from being enabled
   if (!hasData) {
      return res
         .status(401)
         .json({ message: "Slug not found - cannot enter preview mode" })
   }
   // Enable Preview Mode by setting the [cookies](https://nextjs.org/docs/advanced-features/preview-mode#step-1-create-and-access-a-preview-api-route)
   res.setPreviewData({})

   // Redirect to the path from the fetched case study
   // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
   res.writeHead(307, {
      Location: location,
   })

   res.end()
}

const getPreviewData = async (
   query: NextApiRequest["query"]
): Promise<{
   hasData: boolean
   location: string
}> => {
   const pageType: PageType = query.pageType as PageType
   const slug = query.slug as string

   switch (pageType) {
      case PageType.TALENT_GUIDE_MODULE_PAGE: {
         const page = await tgPreviewService.getTalentGuideModulePageBySlug(
            slug
         )

         return {
            hasData: Boolean(page),
            location: `/talent-guide/${page.slug}`,
         }
      }

      case PageType.TALENT_GUIDE_ROOT_PAGE: {
         const talentGuideRootPage =
            await tgPreviewService.getTalentGuideRootPage(slug)

         return {
            hasData: Boolean(talentGuideRootPage),
            location: `/${talentGuideRootPage.slug}`, // /talent-guide
         }
      }

      default:
         return {
            hasData: false,
            location: "/",
         }
   }
}

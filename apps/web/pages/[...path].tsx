import { GetStaticPaths } from "next"

import GetSitemapLinks from "sitemap-links"

import WebflowPage, { getStaticProps } from "./index"

export default WebflowPage

export { getStaticProps }

export const getStaticPaths: GetStaticPaths<{ path: string[] }> = async () => {
   // Fetch links from Webflow sitemap
   const sitemapLink = process.env.WEBFLOW_URL + `/sitemap.xml`
   const links = await GetSitemapLinks(sitemapLink).catch((err: any) => {
      console.error(err)
      return []
   })

   // Extract paths from absolute links
   const paths = []
   for (const link of links) {
      const url = new URL(link)
      const path = url.pathname.replace(`/`, ``).split(`/`)

      if (!path.length || !path[0]) continue
      paths.push({
         params: { path, locale: "" }, // prevent localization
      })
   }

   return {
      paths: paths,
      fallback: `blocking`,
   }
}

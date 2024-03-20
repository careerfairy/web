import { mapWebFlowToSiteMap, siteMapXmlWrapper } from "components/util/Sitemap"
import { getServerSideBaseUrl } from "components/util/url"
import { GetServerSideProps } from "next"
import GetSitemapLinks from "sitemap-links"

const GeneratedComponent = () => {
   return null
}

const generateSiteMap = async (basePath: string): Promise<string> => {
   try {
      const sitemapLink = process.env.WEBFLOW_URL + `/sitemap.xml`
      // Fetch the sitemap links using the constructed link
      const links: string[] = await GetSitemapLinks(sitemapLink)

      // Extract path names from the fetched links
      const pathNames = links.map((link) => {
         const url = new URL(link)
         return url.pathname.replace(`/`, ``).split(`/`).join("/")
      })

      // Filter out any empty path names
      const finalPaths = pathNames
         .filter((path) => path.length > 0)
         .map((path) => `${basePath}/${path}`)

      // Generate the sitemap XML content based on the final paths
      return siteMapXmlWrapper(mapWebFlowToSiteMap(finalPaths))
   } catch (error) {
      console.log(error)
   }
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
   // Fetch links from Webflow sitemap
   const sitemap = await generateSiteMap(getServerSideBaseUrl(req))

   res.setHeader("Content-Type", "text/xml")
   // Send the XML to the browser
   res.write(sitemap)
   res.end()

   return {
      props: {},
   }
}

export default GeneratedComponent

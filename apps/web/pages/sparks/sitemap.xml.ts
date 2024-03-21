import { mapSparksToSiteMap, siteMapXmlWrapper } from "components/util/Sitemap"
import { getServerSideBaseUrl } from "components/util/url"
import { sparkRepo } from "data/RepositoryInstances"
import { GetServerSideProps } from "next"

const SparksSitemap = () => {
   return null
}

const generateSiteMap = async (basePath: string) => {
   const results = await sparkRepo.getPublicSparksFeed()

   return siteMapXmlWrapper(mapSparksToSiteMap(`${basePath}/sparks`, results))
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
   // Generate the XML sitemap
   const sitemap = await generateSiteMap(getServerSideBaseUrl(req))

   res.setHeader("Content-Type", "text/xml")
   // Send the XML sitemap to the browser
   res.write(sitemap)
   res.end()

   return {
      props: {},
   }
}

export default SparksSitemap

import {
   mapLiveStreamsToSiteMap,
   siteMapXmlWrapper,
} from "components/util/Sitemap"
import { getServerSideBaseUrl } from "components/util/url"
import { livestreamRepo } from "data/RepositoryInstances"
import { GetServerSideProps } from "next"

const UpcomingEventsSitemap = () => {
   return null
}

const generateSiteMap = async (basePath: string) => {
   const results = await livestreamRepo.getUpcomingEvents()

   return siteMapXmlWrapper(
      mapLiveStreamsToSiteMap(
         `${basePath}/next-livestreams/livestream`,
         results
      )
   )
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
   // Generate the XML sitemap
   const sitemap = await generateSiteMap(getServerSideBaseUrl(req))

   res.setHeader("Content-Type", "text/xml")
   // Send the XML to the browser
   res.write(sitemap)
   res.end()

   return {
      props: {},
   }
}

export default UpcomingEventsSitemap

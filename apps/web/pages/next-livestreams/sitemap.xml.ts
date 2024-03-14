import {
   mapLiveStreamsToSiteMap,
   siteMapXmlWrapper,
} from "components/util/Sitemap"
import { livestreamRepo } from "data/RepositoryInstances"
import { GetServerSideProps } from "next"

const UpcomingEventsSitemap = () => {
   return null
}

const generateSiteMap = async () => {
   const results = await livestreamRepo.getUpcomingEvents()

   return siteMapXmlWrapper(
      mapLiveStreamsToSiteMap("/next-livestreams/livestream", results)
   )
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
   // Generate the XML sitemap
   const sitemap = await generateSiteMap()

   res.setHeader("Content-Type", "text/xml")
   // Send the XML to the browser
   res.write(sitemap)
   res.end()

   return {
      props: {},
   }
}

export default UpcomingEventsSitemap

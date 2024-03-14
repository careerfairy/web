import {
   mapLiveStreamsToSiteMap,
   siteMapXmlWrapper,
} from "components/util/Sitemap"
import { livestreamRepo } from "data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import { GetServerSideProps } from "next"

const PastEventsSitemap = () => {
   return null
}

const generateSiteMap = async () => {
   const results = await livestreamRepo.getPastEventsFrom({
      fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
   })

   return siteMapXmlWrapper(
      mapLiveStreamsToSiteMap("/past-livestreams/livestream", results)
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

export default PastEventsSitemap

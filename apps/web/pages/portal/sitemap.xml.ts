import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   mapLiveStreamsToSiteMap,
   siteMapXmlWrapper,
} from "components/util/Sitemap"
import { livestreamRepo } from "data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import { GetServerSideProps } from "next"

const PortalSitemap = () => {
   return null
}

const generateSiteMap = async () => {
   const promises = []
   promises.push(
      livestreamRepo.getUpcomingEvents(20),
      livestreamRepo.getPastEventsFrom({
         fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
         limit: 6,
      })
   )

   const results = await Promise.allSettled(promises)

   const fulfilledResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result: PromiseFulfilledResult<LivestreamEvent>) => result.value)
      .flat()

   return siteMapXmlWrapper(
      mapLiveStreamsToSiteMap("/portal/livestream", fulfilledResults)
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

export default PortalSitemap

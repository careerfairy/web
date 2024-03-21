import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   mapLiveStreamsToSiteMap,
   mapSparksToSiteMap,
   siteMapXmlWrapper,
} from "components/util/Sitemap"
import { getServerSideBaseUrl } from "components/util/url"
import { livestreamRepo, sparkRepo } from "data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import { GetServerSideProps } from "next"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

const PortalSitemap = () => {
   return null
}

const generateSiteMap = async (basePath: string) => {
   const promises = []
   promises.push(
      livestreamRepo.getUpcomingEvents(20),
      livestreamRepo.getPastEventsFrom({
         fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
         limit: 6,
      }),
      sparkRepo.getPublicSparksFeed(8)
   )

   const [upcomingEvents, pastEvents, sparks] = await Promise.allSettled(
      promises
   )

   const fulfilledEvents = [upcomingEvents, pastEvents]
      .filter((result) => result.status === "fulfilled")
      .map((result: PromiseFulfilledResult<LivestreamEvent>) => result.value)
      .flat()

   const fulfilledSparks: Spark[] =
      sparks.status === "fulfilled" ? sparks.value : []

   return siteMapXmlWrapper(
      mapSparksToSiteMap(`${basePath}/sparks`, fulfilledSparks) +
         mapLiveStreamsToSiteMap(
            `${basePath}/portal/livestream`,
            fulfilledEvents
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

export default PortalSitemap

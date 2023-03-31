import React from "react"
import { useLivestreamsAnalyticsPageContext } from "../LivestreamAnalyticsPageProvider"

const AggregatedUniversitySources = () => {
   const { currentStreamStats } = useLivestreamsAnalyticsPageContext()

   if (!currentStreamStats)
      return <div>Loading AggregatedUniversitySources</div>

   return <div>AggregatedUniversitySources</div>
}

export default AggregatedUniversitySources

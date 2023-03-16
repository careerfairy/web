import React, { useMemo } from "react"
import {
   SourceEntryArgs,
   SourcesProgress,
} from "../../../common/SourcesProgress"
import CardCustom from "../../../common/CardCustom"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { useAnalyticsPageContext } from "../GeneralPageProvider"

const LivestreamsKPIs = () => {
   const { livestreamStats } = useAnalyticsPageContext()

   const sources = useMemo<SourceEntryArgs[]>(() => {
      // Numbers can be gotten by reducing the livestreamStats array
      return [
         {
            name: "Talent Reached",
            value: 10,
            help: "Talent reached",
            percent: 20,
         },
         {
            name: "Registrations",
            value: 20,
            help: "Registrations",
            percent: 50,
         },
         {
            name: "Participants",
            help: "Participants",
            value: 30,
            percent: 66,
         },
      ].sort(dynamicSort("percent", "desc"))
   }, [])

   return (
      <CardCustom title={"Live streams KPIs overview"}>
         <SourcesProgress
            leftHeaderTitle={"KPI"}
            rightHeaderTitle={"Users"}
            sources={sources}
         />
      </CardCustom>
   )
}

export default LivestreamsKPIs

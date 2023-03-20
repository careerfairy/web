import React, { useMemo } from "react"
import {
   SourceEntryArgs,
   SourcesProgress,
} from "../../../common/SourcesProgress"
import CardCustom from "../../../common/CardCustom"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import { useAnalyticsPageContext } from "../GeneralPageProvider"
import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { totalPeopleReachedByLivestreamStat } from "../../../common/util"

const LivestreamsKPIs = () => {
   const { livestreamStats } = useAnalyticsPageContext()

   const sources = useMemo<SourceEntryArgs[]>(
      () => getSourceStats(livestreamStats),
      [livestreamStats]
   )

   return (
      <CardCustom title={"Live streams KPIs overview"}>
         <SourcesProgress
            leftHeaderTitle={"KPI"}
            rightHeaderTitle={"Users"}
            sources={sources}
            loading={livestreamStats === undefined}
         />
      </CardCustom>
   )
}

const getSourceStats = (
   livestreamStats: LiveStreamStats[]
): SourceEntryArgs[] => {
   let totalTalentReached = 0
   let totalRegistrations = 0
   let totalParticipants = 0

   if (livestreamStats) {
      livestreamStats.forEach((livestreamStat) => {
         totalParticipants +=
            livestreamStat.generalStats?.numberOfParticipants ?? 0
         totalRegistrations +=
            livestreamStat.generalStats?.numberOfRegistrations ?? 0
         totalTalentReached +=
            totalPeopleReachedByLivestreamStat(livestreamStat)
      })
   }

   const highestValue = Math.max(
      totalTalentReached,
      totalRegistrations,
      totalParticipants
   )

   const sources: SourceEntryArgs[] = [
      {
         name: "Talent Reached",
         value: totalTalentReached,
         help: "Talent reached",
         percent: 0,
      },
      {
         name: "Registrations",
         value: totalRegistrations,
         help: "Registrations",
         percent: 0,
      },
      {
         name: "Participants",
         value: totalParticipants,
         help: "Participants",
         percent: 0,
      },
   ]

   sources.forEach((source) => {
      if (highestValue === 0) return // we avoid potentially dividing by zero
      source.percent = Math.round((source.value / highestValue) * 100)
   })

   return sources.sort(dynamicSort("percent", "desc"))
}

export default LivestreamsKPIs

import { LinearProgress } from "@mui/material"
import { useGroup } from "layouts/GroupDashboardLayout"
import React, { useCallback, useMemo, useState } from "react"
import { VALID_SOURCES } from "@careerfairy/shared-lib/livestreams/sources/sources"
import { sourcesByLivestream } from "@careerfairy/shared-lib/livestreams/sources/transformations"
import CardCustom from "../../common/CardCustom"
import { useMainPageContext } from "../MainPageProvider"
import { useRegistrationSourcesData } from "./useRegistrationSourcesData"
import {
   SourceEntryArgs,
   SourcesProgress,
   SourcesProgressTitle,
} from "../../common/SourcesProgress"

const CARD_OPTIONS = [
   "Next live stream",
   "Last live stream",
   "All live streams",
] as const

const TITLE = "Registration Sources Overview"

export const AggregatedRegistrationSourcesCard = () => {
   const { pastLivestream, nextLivestream } = useMainPageContext()

   if (
      pastLivestream === undefined || // loading
      nextLivestream === undefined || // loading
      (pastLivestream === null && nextLivestream === null) // both non existent
   ) {
      return (
         <CardCustom title={TITLE} options={CARD_OPTIONS}>
            <EmptySourcesProgress />
         </CardCustom>
      )
   }

   return <AllDataAvailable />
}

const AllDataAvailable = () => {
   const { group } = useGroup()
   const { pastLivestream, nextLivestream } = useMainPageContext()

   // set the dropdown options
   const options = useMemo(() => {
      const options = [...CARD_OPTIONS]

      if (!nextLivestream && pastLivestream) {
         // hide Next Livestream entry
         options.splice(0, 1)
         return options
      }

      if (!pastLivestream && nextLivestream) {
         // hide Past Livestream entry
         options.splice(1, 1)
         return options
      }

      return options
   }, [nextLivestream, pastLivestream])

   // select the livestream stats to display
   const [selectedLivestream, setSelectedLivestream] = useState(
      nextLivestream ? nextLivestream : pastLivestream
   )

   const optionsHandler = useCallback(
      (option: string) => {
         switch (option) {
            case CARD_OPTIONS[0]:
               setSelectedLivestream(nextLivestream)
               break
            case CARD_OPTIONS[1]:
               setSelectedLivestream(pastLivestream)
               break
            default:
               setSelectedLivestream(undefined) // will fetch all livestreams
         }
      },
      [nextLivestream, pastLivestream]
   )

   return (
      <CardCustom
         title={TITLE}
         options={options}
         optionsHandler={optionsHandler}
      >
         <LoadStaleWhileRevalidateStats
            // by changing the key, we reset the component state
            // useful to show a loading bar when fetching All Livestreams
            key={
               selectedLivestream?.id
                  ? "keep"
                  : "force re-render when switching to all livestreams"
            }
            groupId={group.id}
            livestream={selectedLivestream}
         />
      </CardCustom>
   )
}

const emptySources = VALID_SOURCES.map((s) => ({
   name: s.displayName,
   help: s.helpDescription,
   value: 0,
   percent: 0,
})).sort(sortSources) // memoized

const EmptySourcesProgress = () => {
   // Show all sources but with 0's
   return (
      <SourcesProgress
         leftHeaderComponent={
            <SourcesProgressTitle>Channel</SourcesProgressTitle>
         }
         rightHeaderComponent={
            <SourcesProgressTitle textAlign="right">Users</SourcesProgressTitle>
         }
         sources={emptySources}
      />
   )
}

const LoadStaleWhileRevalidateStats = ({ groupId, livestream }) => {
   const data = useRegistrationSourcesData(groupId, livestream?.id)

   // calculate the stats
   const stats = useMemo<SourceEntryArgs[]>(() => {
      if (data.loading || !data.data) return []
      const stats = sourcesByLivestream(data.data)

      return VALID_SOURCES.map((s) => {
         const match = stats.find((m) => m.source.id === s.id)

         return {
            name: s.displayName,
            help: s.helpDescription,
            value: match ? match.total : 0,
            percent: match ? match.percent : 0,
         }
      }).sort(sortSources)
   }, [data])

   if (data.loading) {
      return <EmptySourcesProgress />
   }

   return (
      <>
         {/* Show a small progress bar when loading all livestreams since 
               it can take a while when there isn't any cache */}
         {/* @ts-ignore grey is a valid color */}
         {!livestream && !data.data && <LinearProgress color="grey" />}
         <SourcesProgress
            leftHeaderComponent={
               <SourcesProgressTitle>Channel</SourcesProgressTitle>
            }
            rightHeaderComponent={
               <SourcesProgressTitle textAlign="right">
                  Users
               </SourcesProgressTitle>
            }
            sources={stats}
         />
      </>
   )
}

function sortSources(a: SourceEntryArgs, b: SourceEntryArgs) {
   const order = [
      "Platform Registrations",
      "Platform User Promo",
      "Social",
      "University Network Promo",
      "Other",
   ]

   const idxFoundA = order.findIndex((o) => o === a.name)
   const idxFoundB = order.findIndex((o) => o === b.name)

   if (idxFoundA >= 0 && idxFoundB >= 0) return idxFoundA - idxFoundB

   return 0
}

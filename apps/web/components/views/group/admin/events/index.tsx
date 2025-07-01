import { Box, CircularProgress } from "@mui/material"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { useRouter } from "next/router"
import { Fragment, SyntheticEvent, useEffect, useMemo, useState } from "react"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { useGroupLivestreams } from "../../../../custom-hook/live-stream/useGroupLivestreams"
import { useLivestreamOrDraft } from "../../../../custom-hook/live-stream/useLivestreamOrDraft"
import { repositionElement } from "../../../../helperFunctions/HelperFunctions"
import EventsTable from "./events-table/EventsTable"

const tabs = [
   {
      label: "Upcoming",
      value: "upcoming",
   },
   {
      label: "Past",
      value: "past",
   },
   {
      label: "Draft",
      value: "draft",
   },
] as const

type TabValue = (typeof tabs)[number]["value"]

export const EventsOverview = () => {
   const { query, push, pathname } = useRouter()

   const { group, livestreamDialog } = useGroup()
   const [groupsDictionary, setGroupsDictionary] = useState({})

   // Get tab value from query params, default to "upcoming"
   const tabValue =
      tabs.find((tabItem) => tabItem.value === query.tab)?.value || "upcoming"

   // Use a single hook call for the current tab
   const currentStreams = useGroupLivestreams(group?.id, tabValue)

   const { data: highlightedEventData } = useLivestreamOrDraft(
      query.eventId as string
   )

   /**
    * Auto switch tabs to the relevant tab
    */
   useAutoSwitchTabs({
      typeOfHighlightedStream: highlightedEventData?.typeOfStream,
      currentTabValue: tabValue,
      isFetchingEvents: currentStreams.isLoading,
      hasNoEvents: currentStreams.data?.length === 0,
   })

   // Process streams data with eventId repositioning
   const streams = useMemo(() => {
      const streamsData = currentStreams.data || []

      if (query.eventId && streamsData.length > 0) {
         const queryEventIndex = streamsData.findIndex(
            (el) => el.id === query.eventId
         )
         if (queryEventIndex > -1) {
            const reorderedStreams = [...streamsData]
            repositionElement(reorderedStreams, queryEventIndex, 0)
            return reorderedStreams
         }
      }

      return streamsData
   }, [currentStreams.data, query.eventId])

   const handleChange = (_: SyntheticEvent, newValue: TabValue) => {
      const cleanQuery = { ...query }

      delete cleanQuery.eventId
      cleanQuery.tab = newValue

      push(
         {
            pathname,
            query: cleanQuery,
         },
         undefined,
         { shallow: true }
      )
   }

   const isLoading = currentStreams.isLoading

   return (
      <Fragment>
         <BrandedTabs mt={1.5} activeValue={tabValue} onChange={handleChange}>
            {tabs.map((tab) => (
               <BrandedTabs.Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  href={`/group/${group?.id}/admin/content/live-streams?tab=${tab.value}`}
                  shallow
               />
            ))}
         </BrandedTabs>
         <Box p={3}>
            {isLoading ? (
               <Box
                  height={150}
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                  display="flex"
               >
                  <CircularProgress color="primary" />
               </Box>
            ) : (
               <EventsTable
                  isDraft={tabValue === "draft"}
                  isPast={tabValue === "past"}
                  streams={streams}
                  groupsDictionary={groupsDictionary}
                  group={group}
                  eventId={query.eventId as string}
                  setGroupsDictionary={setGroupsDictionary}
                  onPublishStream={livestreamDialog.handlePublishStream}
                  publishingDraft={livestreamDialog.isPublishing}
               />
            )}
         </Box>
      </Fragment>
   )
}

type AutoSwitchTabsProps = {
   typeOfHighlightedStream: TabValue
   currentTabValue: TabValue
   isFetchingEvents: boolean
   hasNoEvents: boolean
}

/**
 * Custom hook that automatically switches tabs based on highlighted stream type and event availability
 */
const useAutoSwitchTabs = ({
   typeOfHighlightedStream,
   currentTabValue,
   isFetchingEvents,
   hasNoEvents,
}: AutoSwitchTabsProps) => {
   const { pathname, query, push } = useRouter()

   const [alreadyNavigated, setAlreadyNavigated] = useState(false)

   /**
    * If there is a highlighted event, switch to the relevant (upcoming, past, draft) tab to highlight it
    */
   useEffect(() => {
      if (alreadyNavigated) return

      if (
         typeOfHighlightedStream &&
         typeOfHighlightedStream !== currentTabValue
      ) {
         push(
            {
               pathname,
               query: { ...query, tab: typeOfHighlightedStream },
            },
            undefined,
            { shallow: true }
         )
         setAlreadyNavigated(true)
      }
   }, [
      typeOfHighlightedStream,
      query,
      alreadyNavigated,
      push,
      pathname,
      currentTabValue,
   ])

   /**
    * If there are no upcoming events, switch to the past events tab
    */
   useEffect(() => {
      if (isFetchingEvents || alreadyNavigated) return

      if (currentTabValue === "upcoming" && hasNoEvents && !alreadyNavigated) {
         push(
            {
               pathname,
               query: { ...query, tab: "past" },
            },
            undefined,
            { shallow: true }
         )
         setAlreadyNavigated(true)
      }
   }, [
      currentTabValue,
      hasNoEvents,
      alreadyNavigated,
      query,
      isFetchingEvents,
      push,
      pathname,
   ])
}

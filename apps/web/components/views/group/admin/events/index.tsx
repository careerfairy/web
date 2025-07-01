import { Box, CircularProgress } from "@mui/material"
import { BrandedTabs } from "components/views/common/BrandedTabs"
import { livestreamService } from "data/firebase/LivestreamService"
import { useRouter } from "next/router"
import { Fragment, SyntheticEvent, useEffect, useMemo, useState } from "react"
import { useLatest } from "react-use"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { useGroupLivestreams } from "../../../../custom-hook/live-stream/useGroupLivestreams"
import { repositionElement } from "../../../../helperFunctions/HelperFunctions"
import EventsTable from "./events-table/EventsTable"

export const EventsOverview = () => {
   const { group, livestreamDialog } = useGroup()

   const [triggered, setTriggered] = useState(false)
   const [groupsDictionary, setGroupsDictionary] = useState({})
   const router = useRouter()
   const {
      query: { eventId, tab },
   } = router

   // Get tab value from query params, default to "upcoming"
   const tabValue = (tab as "upcoming" | "past" | "draft") || "upcoming"
   const latestTabValue = useLatest(tabValue)

   // Use a single hook call for the current tab
   const currentStreams = useGroupLivestreams(group?.id, tabValue)

   // Process streams data with eventId repositioning
   const streams = useMemo(() => {
      const streamsData = currentStreams.data || []

      if (eventId && streamsData.length > 0) {
         const queryEventIndex = streamsData.findIndex(
            (el) => el.id === eventId
         )
         if (queryEventIndex > -1) {
            const reorderedStreams = [...streamsData]
            repositionElement(reorderedStreams, queryEventIndex, 0)
            return reorderedStreams
         }
      }

      return streamsData
   }, [currentStreams.data, eventId])

   // Use SWR to fetch target event data
   const { data: targetEventData } = useSWR(
      eventId ? `targetEvent-${eventId}` : null,
      () => livestreamService.findTargetEvent(eventId.toString()),
      {
         revalidateOnFocus: false,
         revalidateOnReconnect: false,
         onError: (error) => {
            errorLogAndNotify(error, {
               title: "Error fetching target event",
            })
         },
      }
   )

   // Set tab value when target event data is available
   useEffect(() => {
      if (
         !triggered &&
         targetEventData?.typeOfStream &&
         targetEventData.typeOfStream !== latestTabValue.current
      ) {
         router.push(
            {
               pathname: router.pathname,
               query: { ...router.query, tab: targetEventData.typeOfStream },
            },
            undefined,
            { shallow: true }
         )
         setTriggered(true)
      }
   }, [targetEventData, router, triggered, latestTabValue])

   // Handle fallback to past tab if upcoming is empty
   useEffect(() => {
      if (
         tabValue === "upcoming" &&
         !currentStreams.isLoading &&
         currentStreams.data?.length === 0 &&
         !triggered
      ) {
         router.push(
            {
               pathname: router.pathname,
               query: { ...router.query, tab: "past" },
            },
            undefined,
            { shallow: true }
         )
         setTriggered(true)
      }
   }, [
      tabValue,
      currentStreams.isLoading,
      currentStreams.data,
      triggered,
      router,
   ])

   const handleChange = (
      _: SyntheticEvent,
      newValue: "upcoming" | "past" | "draft"
   ) => {
      router.push(
         {
            pathname: router.pathname,
            query: { ...router.query, tab: newValue },
         },
         undefined,
         { shallow: true }
      )
   }

   const isLoading = currentStreams.isLoading

   return (
      <Fragment>
         <BrandedTabs mt={1.5} activeValue={tabValue} onChange={handleChange}>
            <BrandedTabs.Tab label="Upcoming" value="upcoming" />
            <BrandedTabs.Tab label="Past" value="past" />
            <BrandedTabs.Tab label="Draft" value="draft" />
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
                  eventId={eventId as string}
                  setGroupsDictionary={setGroupsDictionary}
                  onPublishStream={livestreamDialog.handlePublishStream}
                  publishingDraft={livestreamDialog.isPublishing}
               />
            )}
         </Box>
      </Fragment>
   )
}

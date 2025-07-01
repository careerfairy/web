import { Box, CircularProgress } from "@mui/material"
import { livestreamService } from "data/firebase/LivestreamService"
import { useRouter } from "next/router"
import { Fragment, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import { useGroupLivestreams } from "../../../../custom-hook/live-stream/useGroupLivestreams"
import { repositionElement } from "../../../../helperFunctions/HelperFunctions"
import EventsTable from "./events-table/EventsTable"

export const EventsOverview = () => {
   const { group, livestreamDialog } = useGroup()

   const [tabValue, setTabValue] = useState<"upcoming" | "past" | "draft">(
      "upcoming"
   )

   const [triggered, setTriggered] = useState(false)
   const [groupsDictionary, setGroupsDictionary] = useState({})
   const {
      query: { eventId },
   } = useRouter()

   // Use a single hook call for the current tab
   const currentStreams = useGroupLivestreams(group?.id, tabValue)
   console.log("🚀 ~ EventsOverview ~ currentStreams:", currentStreams)

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
      if (targetEventData?.typeOfStream && targetEventData?.targetStream) {
         setTabValue(targetEventData.typeOfStream)
      }
   }, [targetEventData])

   // Handle fallback to past tab if upcoming is empty
   useEffect(() => {
      if (
         tabValue === "upcoming" &&
         !currentStreams.isLoading &&
         currentStreams.data?.length === 0 &&
         !triggered
      ) {
         setTabValue("past")
         setTriggered(true)
      }
   }, [tabValue, currentStreams.isLoading, currentStreams.data, triggered])

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const handleChange = (event, newValue) => {
      setTabValue(newValue)
   }

   const isLoading = currentStreams.isLoading

   return (
      <Fragment>
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

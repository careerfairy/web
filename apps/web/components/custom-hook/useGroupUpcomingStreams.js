import React, { useMemo } from "react"
import { useFirestoreConnect } from "react-redux-firebase"
import { useSelector } from "react-redux"
import groupUpcomingLivestreamsSelector from "../selectors/groupUpcomingLivestreamsSelector"
import {
   FORTY_FIVE_MINUTES_IN_MILLISECONDS,
   START_DATE_FOR_REPORTED_EVENTS,
   UPCOMING_LIVESTREAMS_NAME,
} from "../../data/constants/streamContants"

const currentTime = new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS)
const earliestTime = new Date(START_DATE_FOR_REPORTED_EVENTS)

const upcomingLivestreamsQuery = [["start", ">", currentTime]]
const pastLivestreamsQuery = [
   ["start", "<", currentTime],
   ["start", ">", earliestTime],
]

const useListenToGroupStreams = (
   livestreamId,
   groupId,
   selectedOptions,
   typeOfStreams = UPCOMING_LIVESTREAMS_NAME
) => {
   const query = useMemo(() => {
      const isUpcoming = typeOfStreams === UPCOMING_LIVESTREAMS_NAME
      return [
         {
            collection: "livestreams",
            where: [
               ["groupIds", "array-contains", groupId],
               isUpcoming
                  ? [...upcomingLivestreamsQuery]
                  : [...pastLivestreamsQuery],
               ["test", "==", false],
            ],
            orderBy: ["start", isUpcoming ? "asc" : "desc"],
            storeAs: `${typeOfStreams} of ${groupId}`,
         },
      ]
   }, [typeOfStreams, groupId])

   useFirestoreConnect(query)

   return useSelector((state) =>
      groupUpcomingLivestreamsSelector(
         state.firestore.ordered[`${typeOfStreams} of ${groupId}`],
         {
            livestreamId,
            groupId,
            selectedOptions,
         }
      )
   )
}

export default useListenToGroupStreams

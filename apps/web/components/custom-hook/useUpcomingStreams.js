import React from "react"
import { useFirestoreConnect } from "react-redux-firebase"
import { useSelector } from "react-redux"
import upcomingLivestreamsSelector from "../selectors/upcomingLivestreamsSelector"
import {
   FORTY_FIVE_MINUTES_IN_MILLISECONDS,
   UPCOMING_LIVESTREAMS_NAME,
} from "../../data/constants/streamContants"

const targetTime = new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS)

const useUpcomingStreams = (livestreamId) => {
   useFirestoreConnect(() => [
      {
         collection: "livestreams",
         where: [
            ["start", ">", targetTime],
            ["test", "==", false],
         ],
         orderBy: ["start", "asc"],
         storeAs: UPCOMING_LIVESTREAMS_NAME,
      },
   ])

   return useSelector((state) =>
      upcomingLivestreamsSelector(
         state.firestore.ordered[UPCOMING_LIVESTREAMS_NAME],
         { livestreamId }
      )
   )
}

export default useUpcomingStreams

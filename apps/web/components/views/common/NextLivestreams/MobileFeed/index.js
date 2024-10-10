import { useEffect, useState } from "react"

import { Box } from "@mui/material"
import { useRouter } from "next/router"
import GroupStreams from "../GroupStreams/GroupStreams"

const MobileFeed = ({
   groupData,
   livestreams,
   searching,
   scrollToTop,
   careerCenterId,
   listenToUpcoming,
   selectedOptions,
   isPastLivestreams,
   noResultsComponent,
}) => {
   const [value, setValue] = useState(0)
   const { query } = useRouter()

   useEffect(() => {
      if (groupData) {
         handleResetView()
      }
   }, [groupData.universityName])

   useEffect(() => {
      if (query?.groupId) {
         scrollToTop()
      }
   }, [value, query])

   const handleResetView = () => {
      setValue(0)
   }

   return (
      <Box p={2}>
         <GroupStreams
            listenToUpcoming={listenToUpcoming}
            careerCenterId={careerCenterId}
            isPastLivestreams={isPastLivestreams}
            selectedOptions={selectedOptions}
            searching={searching}
            livestreams={livestreams}
            groupData={groupData}
            noResultsComponent={noResultsComponent}
         />
      </Box>
   )
}

export default MobileFeed

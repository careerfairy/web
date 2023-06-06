import React, { useCallback, useEffect, useState } from "react"
import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import DesktopFeed from "./DesktopFeed/DesktopFeed"
import { useRouter } from "next/router"
import { getServerSideRouterQuery } from "../../../helperFunctions/HelperFunctions"
import MobileFeed from "./MobileFeed"

const NextLivestreams = ({
   livestreams,
   currentGroup,
   isPastLivestreams,
   listenToUpcoming,
   noResultsComponent,
}) => {
   const theme = useTheme()
   const mobile = useMediaQuery(theme.breakpoints.down("md"))
   const router = useRouter()

   const careerCenterId = getServerSideRouterQuery("careerCenterId", router)

   const [groupData, setGroupData] = useState({})

   useEffect(() => {
      if (currentGroup) {
         setGroupData(currentGroup)
      }
   }, [currentGroup])

   const scrollToTop = useCallback(() => {
      window.scrollTo({
         top: 250,
         behavior: "smooth",
      })
   }, [])

   const handleToggleActive = useCallback(
      (activeOptions, categoryId) => {
         const newGroupData = {
            ...groupData,
            categories:
               groupData.categories?.map((category) =>
                  category.id !== categoryId
                     ? category
                     : {
                          ...category,
                          options: category.options.map((option) => ({
                             ...option,
                             active: activeOptions.includes(option.id),
                          })),
                       }
               ) || [],
         }
         setGroupData(newGroupData)
      },
      [groupData]
   )

   return mobile ? (
      <MobileFeed
         groupData={groupData}
         scrollToTop={scrollToTop}
         livestreams={livestreams}
         listenToUpcoming={listenToUpcoming}
         careerCenterId={careerCenterId}
         isPastLivestreams={isPastLivestreams}
         noResultsComponent={noResultsComponent}
      />
   ) : (
      <DesktopFeed
         handleToggleActive={handleToggleActive}
         listenToUpcoming={listenToUpcoming}
         careerCenterId={careerCenterId}
         livestreams={livestreams}
         mobile={mobile}
         groupData={groupData}
         isPastLivestreams={isPastLivestreams}
         noResultsComponent={noResultsComponent}
      />
   )
}

export default NextLivestreams

import React, { useEffect, useState } from "react"
import { useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import DesktopFeed from "./DesktopFeed/DesktopFeed"
import { useRouter } from "next/router"
import { getServerSideRouterQuery } from "../../helperFunctions/HelperFunctions"
import { useAuth } from "../../../HOCs/AuthProvider"
import MobileFeed from "./MobileFeed"

const NextLivestreams = ({
   livestreams,
   currentGroup,
   selectedOptions,
   setSelectedOptions,
   isPastLivestreams,
   listenToUpcoming,
}) => {
   const { userData } = useAuth()
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

   useEffect(() => {
      if (groupData && groupData.categories) {
         let activeOptions = []
         groupData.categories.forEach((category) => {
            category.options.forEach((option) => {
               if (option.active === true) {
                  activeOptions.push(option.id)
               }
            })
         })
         setSelectedOptions(activeOptions)
      }
   }, [groupData.categories, groupData])

   const scrollToTop = () => {
      window.scrollTo({
         top: 250,
         behavior: "smooth",
      })
   }

   const handleToggleActive = (activeOptions, categoryId) => {
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
   }
   const hasCategories = () => {
      if (groupData?.categories?.length) {
         const filteredCategories = groupData.categories.filter(
            (category) => category.name.toLowerCase() !== "level of study"
         )
         return filteredCategories.length
      } else {
         return 0
      }
   }

   return mobile ? (
      <MobileFeed
         groupData={groupData}
         hasCategories={hasCategories()}
         selectedOptions={selectedOptions}
         scrollToTop={scrollToTop}
         livestreams={livestreams}
         listenToUpcoming={listenToUpcoming}
         careerCenterId={careerCenterId}
         alreadyJoined={groupData.alreadyJoined}
         handleToggleActive={handleToggleActive}
         userData={userData}
         isPastLivestreams={isPastLivestreams}
      />
   ) : (
      <DesktopFeed
         handleToggleActive={handleToggleActive}
         hasCategories={hasCategories()}
         listenToUpcoming={listenToUpcoming}
         selectedOptions={selectedOptions}
         careerCenterId={careerCenterId}
         livestreams={livestreams}
         mobile={mobile}
         groupData={groupData}
         isPastLivestreams={isPastLivestreams}
      />
   )
}

export default NextLivestreams

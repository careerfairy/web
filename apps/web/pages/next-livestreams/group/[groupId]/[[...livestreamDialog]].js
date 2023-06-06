import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import NextLivestreamsLayout from "layouts/NextLivestreamsLayout"
import GroupBannerSection from "components/views/common/NextLivestreams/GroupBannerSection"
import { useFirestoreConnect } from "react-redux-firebase"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import HeadWithMeta from "components/page/HeadWithMeta"
import { NEXT_LIVESTREAMS_PATH, PRODUCTION_BASE_URL } from "constants/routes"
import { StreamsSection } from "components/views/common/NextLivestreams/StreamsSection"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import { getServerSideGroup } from "util/serverUtil"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import ScrollToTop from "components/views/common/ScrollToTop"
import { placeholderBanner } from "../../../../constants/images"
import useListenToStreams from "../../../../components/custom-hook/useListenToStreams"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import {
   getLivestreamDialogData,
   LivestreamDialogLayout,
} from "../../../../components/views/livestream-dialog"

const GroupPage = ({
   serverSideGroup,
   initialTabValue,
   livestreamDialogData,
}) => {
   const {
      palette: {
         common: { white },
         navyBlue,
      },
   } = useTheme()
   const [value, setValue] = useState(initialTabValue || "upcomingEvents")
   const [switchedToPastTab, setSwitchedToPastTab] = useState(false)

   const currentGroup = useSelector(
      (state) =>
         state.firestore.data[`group ${serverSideGroup.groupId}`] ||
         serverSideGroup
   )
   const dispatch = useDispatch()

   useEffect(() => {
      dispatch(actions.closeNextLivestreamsFilter())
   }, [currentGroup.groupId])

   useFirestoreConnect(() => [
      {
         collection: "careerCenterData",
         doc: currentGroup.groupId,
         storeAs: "currentGroup",
      },
   ])

   const upcomingLivestreams = useListenToStreams({
      filterByGroupId: currentGroup.groupId,
      getHiddenEvents: true,
   })

   const [pastLivestreams, setPastLivestreams] = useState(undefined)

   // switch to upcoming tab when switching groups
   useEffect(() => {
      setValue("upcomingEvents")
      setSwitchedToPastTab(false)
   }, [currentGroup.groupId])

   // switch to past tab when there are no upcoming events
   useEffect(() => {
      if (upcomingLivestreams?.length === 0 && !switchedToPastTab) {
         setValue("pastEvents")
         setSwitchedToPastTab(true)
      }
   }, [upcomingLivestreams])

   useEffect(() => {
      // load past events when changing tabs
      if (value === "pastEvents") {
         livestreamRepo
            .getPastEventsFrom({
               fromDate: new Date(START_DATE_FOR_REPORTED_EVENTS),
               filterByGroupId: currentGroup.groupId,
               showHidden: true,
            })
            .then((data) => {
               setPastLivestreams(data ?? [])
            })
            .catch(console.error)
      }
   }, [value, currentGroup.groupId])

   const metaInfo = useMemo(() => {
      return {
         description: currentGroup.description,
         title: `CareerFairy | Next Livestreams of ${currentGroup.universityName}`,
         image: getResizedUrl(currentGroup.logoUrl, "lg"),
         fullPath: `${PRODUCTION_BASE_URL}${NEXT_LIVESTREAMS_PATH}/${currentGroup.groupId}`,
      }
   }, [currentGroup])

   const handleChange = useCallback((event, newValue) => {
      setValue(newValue)
   }, [])

   return (
      <LivestreamDialogLayout livestreamDialogData={livestreamDialogData}>
         <HeadWithMeta {...metaInfo} />
         <NextLivestreamsLayout currentGroup={currentGroup}>
            <div>
               <GroupBannerSection
                  color={white}
                  tabsColor={white}
                  backgroundImageClassName=""
                  backgroundColor={navyBlue.main}
                  groupLogo={currentGroup.logoUrl}
                  backgroundImage={
                     getResizedUrl(currentGroup.bannerImageUrl, "lg") ||
                     placeholderBanner
                  }
                  groupBio={currentGroup.extraInfo}
                  backgroundImageOpacity={0.8}
                  title={currentGroup.universityName}
                  subtitle={currentGroup.description}
                  handleChange={handleChange}
                  value={value}
               />
               <StreamsSection
                  value={value}
                  upcomingLivestreams={upcomingLivestreams}
                  currentGroup={currentGroup}
                  pastLivestreams={pastLivestreams}
                  minimumUpcomingStreams={0}
               />
            </div>
         </NextLivestreamsLayout>
         <ScrollToTop />
      </LivestreamDialogLayout>
   )
}

export async function getServerSideProps(ctx) {
   const serverSideGroup = await getServerSideGroup(ctx.params.groupId)

   if (!serverSideGroup || Object.keys(serverSideGroup)?.length === 0) {
      return {
         notFound: true,
      }
   }

   let initialTabValue = null
   if (ctx.query.type === "upcomingEvents" || ctx.query.type === "pastEvents") {
      initialTabValue = ctx.query.type
   }

   return {
      props: {
         serverSideGroup,
         initialTabValue,
         livestreamDialogData: await getLivestreamDialogData(ctx),
      }, // will be passed to the page component as props
   }
}

export default GroupPage

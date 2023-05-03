import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import React, { FC, ReactNode, useMemo } from "react"
import useLivestreamHosts from "../../../custom-hook/live-stream/useLivestreamHosts"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import useRecordingAccess from "../../upcoming-livestream/HeroSection/useRecordingAccess"
import DateUtil from "../../../../util/DateUtil"
import PlayIcon from "@mui/icons-material/PlayCircleOutline"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import ContentButton from "./ContentButton"
import Content from "./Content"
import useLivestream from "../../../custom-hook/live-stream/useLivestream"
import { UserStats } from "@careerfairy/shared-lib/users"

type LivestreamContentProps = {
   livestreamData: LivestreamEvent
   handleBannerPlayRecording: (livestream: LivestreamEvent) => void
   userStats: UserStats
   handleClickRegister: ReturnType<
      typeof useRegistrationModal
   >["handleClickRegister"]
}
const LivestreamContent: FC<LivestreamContentProps> = ({
   livestreamData,
   handleBannerPlayRecording,
   handleClickRegister,
   userStats,
}) => {
   const { data } = useLivestream(livestreamData.id, livestreamData)
   const livestream = data || livestreamData

   const hosts = useLivestreamHosts(livestream)
   const livestreamPresenter = useMemo(
      () =>
         LivestreamPresenter.createFromDocument(livestream || livestreamData),
      [livestream, livestreamData]
   )

   const {
      userHasAccessToRecordingThroughRegistering,
      userHasBoughtRecording,
      showRecording,
   } = useRecordingAccess(userStats?.userId, livestreamPresenter, userStats)

   const eventIsUpcoming = useMemo(
      () => !livestreamPresenter.isPast(),
      [livestreamPresenter]
   )

   const hasRegistered = useMemo(
      () => livestreamPresenter.isUserRegistered(userStats?.userId),
      [livestreamPresenter, userStats?.userId]
   )

   const headerTitle = useMemo(() => {
      if (eventIsUpcoming) {
         return "Coming Next!"
      }

      if (userHasAccessToRecordingThroughRegistering) {
         return "What You've Missed"
      }

      return "Worth A Look!"
   }, [eventIsUpcoming, userHasAccessToRecordingThroughRegistering])

   const subtitle = useMemo(() => {
      if (eventIsUpcoming) {
         // Should return something like "Live on 17 April 2023"
         return `Live on ${DateUtil.dateWithYear(livestream.start.toDate())}`
      }

      if (
         !userHasBoughtRecording &&
         userHasAccessToRecordingThroughRegistering
      ) {
         const timeLeft = DateUtil.calculateTimeLeft(
            livestreamPresenter.recordingAccessTimeLeft()
         )

         return timeLeft?.Days === 0
            ? "Last day to rewatch"
            : `Recording available for ${timeLeft.Days} days`
      }

      return ""
   }, [
      eventIsUpcoming,
      livestream.start,
      livestreamPresenter,
      userHasAccessToRecordingThroughRegistering,
      userHasBoughtRecording,
   ])

   const actionItem = useMemo<ReactNode>(() => {
      if (eventIsUpcoming) {
         return (
            <ContentButton
               color={"secondary"}
               onClick={() =>
                  handleClickRegister(
                     livestream,
                     hosts?.[0]?.id,
                     hosts || [],
                     hasRegistered
                  )
               }
            >
               {hasRegistered ? "Registered" : "Register to Live Stream"}
            </ContentButton>
         )
      }

      if (showRecording) {
         return (
            <ContentButton
               color={"primary"}
               onClick={() => handleBannerPlayRecording(livestream)}
               endIcon={<PlayIcon />}
            >
               Watch now
            </ContentButton>
         )
      }

      return (
         <ContentButton
            href={`upcoming-livestream/${livestream.id}`}
            target={"_blank"}
            color={"primary"}
         >
            Discover Recording
         </ContentButton>
      )
   }, [
      eventIsUpcoming,
      handleBannerPlayRecording,
      handleClickRegister,
      hasRegistered,
      hosts,
      livestream,
      showRecording,
   ])

   return (
      <Content
         headerTitle={headerTitle}
         title={livestream.title}
         subtitle={subtitle}
         logoUrl={getResizedUrl(livestream.companyLogoUrl, "lg")}
         actionItem={actionItem}
      />
   )
}

export default LivestreamContent

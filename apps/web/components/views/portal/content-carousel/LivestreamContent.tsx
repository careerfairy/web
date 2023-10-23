import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import PlayIcon from "@mui/icons-material/PlayCircleOutline"
import { useRouter } from "next/router"
import { FC, ReactNode, useMemo } from "react"
import DateUtil from "../../../../util/DateUtil"
import useLivestream from "../../../custom-hook/live-stream/useLivestream"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { buildDialogLink } from "../../livestream-dialog"
import useRecordingAccess from "../../upcoming-livestream/HeroSection/useRecordingAccess"
import { LivestreamEventWithType } from "./CarouselContentService"
import Content, {
   ContentHeaderTitle,
   ContentSubtitle,
   ContentTitle,
} from "./Content"
import ContentButton from "./ContentButton"

type LivestreamContentProps = {
   livestreamData: LivestreamEventWithType
   handleBannerPlayRecording: (livestream: LivestreamEvent) => void
   userStats: UserStats
   handleClickRegister: ReturnType<
      typeof useRegistrationModal
   >["handleClickRegister"]
}
const LivestreamContent: FC<LivestreamContentProps> = ({
   livestreamData,
   handleBannerPlayRecording,
   userStats,
}) => {
   const router = useRouter()
   const { data } = useLivestream(livestreamData.id, livestreamData)
   const livestream = data || livestreamData

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
               // @ts-ignore
               href={buildDialogLink({
                  router,
                  link: {
                     type: "registerToLivestream",
                     livestreamId: livestream.id,
                  },
               })}
               shallow
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
            // @ts-ignore
            href={buildDialogLink({
               router,
               link: {
                  type: "livestreamDetails",
                  livestreamId: livestream.id,
               },
            })}
            shallow
            color={"primary"}
         >
            Discover Recording
         </ContentButton>
      )
   }, [
      router,
      eventIsUpcoming,
      handleBannerPlayRecording,
      hasRegistered,
      livestream,
      showRecording,
   ])

   return (
      <Content
         headerTitle={
            <ContentHeaderTitle color="white">{headerTitle}</ContentHeaderTitle>
         }
         title={<ContentTitle color="white">{livestream.title}</ContentTitle>}
         subtitle={<ContentSubtitle color="white">{subtitle}</ContentSubtitle>}
         logoUrl={getResizedUrl(livestream.companyLogoUrl, "lg")}
         logoCaption={livestream.company}
         actionItem={actionItem}
         backgroundImageAlt={livestream.company}
         backgroundImageUrl={getResizedUrl(livestream.backgroundImageUrl, "lg")}
      />
   )
}

export default LivestreamContent

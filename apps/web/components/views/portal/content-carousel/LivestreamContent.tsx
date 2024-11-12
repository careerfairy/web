import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { UserStats } from "@careerfairy/shared-lib/users"
import PlayIcon from "@mui/icons-material/PlayCircleOutline"
import { useAuth } from "HOCs/AuthProvider"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import { useRouter } from "next/router"
import { FC, ReactNode, useCallback, useMemo } from "react"
import DateUtil from "../../../../util/DateUtil"
import useLivestream from "../../../custom-hook/live-stream/useLivestream"
import useRegistrationModal from "../../../custom-hook/useRegistrationModal"
import {
   getMaxLineStyles,
   getResizedUrl,
} from "../../../helperFunctions/HelperFunctions"
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
   const { isLoggedIn } = useAuth()
   const router = useRouter()
   const { data } = useLivestream(livestreamData.id, livestreamData)

   const redirectToLogin = useCallback(() => {
      return router.push({
         pathname: `/login`,
         query: `absolutePath=${router.asPath}`,
      })
   }, [router])

   const livestream = data || livestreamData

   const livestreamPresenter = useMemo(
      () =>
         LivestreamPresenter.createFromDocument(livestream || livestreamData),
      [livestream, livestreamData]
   )

   const { showRecording } = useRecordingAccess(
      userStats?.userId,
      livestreamPresenter
   )

   const eventIsUpcoming = useMemo(
      () => !livestreamPresenter.isPast(),
      [livestreamPresenter]
   )

   const hasRegistered = useUserIsRegistered(livestreamPresenter.id)
   const headerTitle = useMemo(() => {
      if (eventIsUpcoming) {
         return "Coming Next!"
      }

      return "Worth A Look!"
   }, [eventIsUpcoming])

   const subtitle = useMemo(() => {
      if (eventIsUpcoming) {
         // Should return something like "Live on 17 April 2023"
         return `Live on ${DateUtil.dateWithYear(livestream.start.toDate())}`
      }

      return ""
   }, [eventIsUpcoming, livestream.start])

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

      if (showRecording && !isLoggedIn) {
         return (
            <ContentButton
               color={"primary"}
               onClick={redirectToLogin}
               endIcon={<PlayIcon />}
            >
               Sign up to watch
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
      isLoggedIn,
      redirectToLogin,
   ])

   console.log(subtitle)

   return (
      <Content
         headerTitle={
            <ContentHeaderTitle color="white">{headerTitle}</ContentHeaderTitle>
         }
         title={
            <ContentTitle color="white" sx={{ ...getMaxLineStyles(3) }}>
               {livestream.title}
            </ContentTitle>
         }
         subtitle={
            subtitle ? (
               <ContentSubtitle color="white">{subtitle}</ContentSubtitle>
            ) : null
         }
         logoUrl={livestream.companyLogoUrl}
         logoCaption={livestream.company}
         actionItem={actionItem}
         backgroundImageAlt={livestream.company}
         backgroundImageUrl={getResizedUrl(livestream.backgroundImageUrl, "lg")}
      />
   )
}

export default LivestreamContent

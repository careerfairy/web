import { FC, useCallback } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import CountDownTimer, { CountdownTimerSkeleton } from "./CountDownTimer"
import LivestreamTagsContainer, {
   LivestreamTagsContainerSkeleton,
} from "./LivestreamTagsContainer"
import HostInfo, { HostInfoSkeleton } from "./HostInfo"
import LivestreamTitle, { LivestreamTitleSkeleton } from "./LivestreamTitle"
import ActionButton, {
   ActionButtonSkeleton,
} from "./action-button/ActionButton"
import useRecordingAccess from "../../../upcoming-livestream/HeroSection/useRecordingAccess"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import RecordingPlayer from "./RecordingPlayer"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import UserUtil from "../../../../../data/util/UserUtil"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { recommendationServiceInstance } from "../../../../../data/firebase/RecommendationService"
import { UserReminderType } from "@careerfairy/shared-lib/users"
import { useUserReminders } from "../../../../../HOCs/UserReminderProvider"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import ShareButton from "./ShareButton"
import { useInView } from "react-intersection-observer"

const LivestreamDetailsView: FC = () => {
   const {
      livestream,
      livestreamPresenter,
      updatedStats,
      serverUserEmail,
      goToView,
   } = useLiveStreamDialog()
   const firebase = useFirebaseService()
   const { forceShowReminder } = useUserReminders()
   const { errorNotification } = useSnackbarNotifications()

   const { authenticatedUser, isLoggedOut, userData } = useAuth()
   const { push, asPath } = useRouter()
   const [heroRef, heroInView] = useInView()

   const isMobile = useIsMobile()

   const { showRecording, userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email || serverUserEmail,
      livestreamPresenter,
      updatedStats
   )

   const handleRegisterClick = useCallback(async () => {
      // Check if the user is already registered
      try {
         const isAlreadyRegistered = livestreamPresenter.isUserRegistered(
            authenticatedUser.email || serverUserEmail
         )

         if (isAlreadyRegistered) {
            await firebase.deregisterFromLivestream(livestream.id, userData)
            recommendationServiceInstance.unRegisterEvent(
               livestream.id,
               userData.authId
            )
            dataLayerLivestreamEvent("event_registration_removed", livestream)
         } else {
            dataLayerLivestreamEvent(
               `event_registration_started${
                  isMobile ? "_from_footer_button" : ""
               }`,
               livestream
            )

            if (isLoggedOut || !authenticatedUser?.emailVerified) {
               dataLayerLivestreamEvent(
                  "event_registration_started_login_required",
                  livestream
               )
               return push({
                  pathname: `/login`,
                  query: { absolutePath: asPath },
               })
            }

            if (!userData || !UserUtil.userProfileIsComplete(userData)) {
               dataLayerLivestreamEvent(
                  "event_registration_started_profile_incomplete",
                  livestream
               )
               return push({
                  pathname: `/profile`,
                  query: { absolutePath: asPath },
               })
            }

            // Try to force show newsletter reminder
            forceShowReminder(UserReminderType.NewsletterReminder)
            goToView("register-data-consent")
         }
      } catch (e) {
         errorNotification(e)
      }
   }, [
      asPath,
      authenticatedUser.email,
      authenticatedUser?.emailVerified,
      errorNotification,
      firebase,
      forceShowReminder,
      goToView,
      isMobile,
      isLoggedOut,
      livestream,
      livestreamPresenter,
      push,
      serverUserEmail,
      userData,
   ])

   if (!livestream) return <LivestreamDetailsViewSkeleton />

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               ref={heroRef}
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
            >
               <ShareButton livestream={livestream} />
               <Stack
                  alignItems="center"
                  justifyContent={"center"}
                  spacing={2.5}
               >
                  <HostInfo presenter={livestreamPresenter} />
                  <LivestreamTitle text={livestream.title} />
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
                  {showRecording ? (
                     <RecordingPlayer
                        stream={livestream}
                        livestreamPresenter={livestreamPresenter}
                        boughtAccess={userHasBoughtRecording}
                     />
                  ) : (
                     <CountDownTimer presenter={livestreamPresenter} />
                  )}
                  <ActionButton
                     livestreamPresenter={livestreamPresenter}
                     onRegisterClick={handleRegisterClick}
                     canWatchRecording={showRecording}
                     isFloating={isMobile || !heroInView}
                     userEmailFromServer={serverUserEmail}
                     heroVisible={heroInView}
                  />
               </Stack>
            </HeroContent>
         }
         mainContent={<DummyMainContent />}
      />
   )
}

const LivestreamDetailsViewSkeleton = () => {
   return (
      <BaseDialogView
         heroContent={
            <HeroContent>
               <Stack alignItems="center" justifyContent={"center"} spacing={2}>
                  <HostInfoSkeleton />
                  <LivestreamTitleSkeleton />
                  <LivestreamTagsContainerSkeleton />
                  <CountdownTimerSkeleton />
                  <ActionButtonSkeleton />
               </Stack>
            </HeroContent>
         }
         mainContent={<DummyMainContent />}
      />
   )
}

const DummyMainContent: FC = () => {
   return (
      <MainContent>
         <Stack pt={2} spacing={2}>
            {/* For Demo Purposes */}
            {Array.from({ length: 10 }).map((_, i) => (
               <HostInfoSkeleton key={i} />
            ))}
         </Stack>
      </MainContent>
   )
}

export default LivestreamDetailsView

import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { useAuth } from "HOCs/AuthProvider"
import useCustomJobsCount from "components/custom-hook/custom-job/useCustomJobsCount"
import { boxShadowAnimation } from "materialUI/GlobalBackground/GlobalBackGround"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import useTrackLivestreamView from "../../../../custom-hook/live-stream/useTrackLivestreamView"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import useRecordingAccess from "../../../upcoming-livestream/HeroSection/useRecordingAccess"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import useRegistrationHandler from "../../useRegistrationHandler"
import CountDownTimer from "./CountDownTimer"
import HeroTags from "./HeroTags"
import HostInfo from "./HostInfo"
import LivestreamTagsContainer from "./LivestreamTagsContainer"
import LivestreamTitle from "./LivestreamTitle"
import MainContentNavigation from "./MainContentNavigation"
import RecordingPlayer from "./RecordingPlayer"
import ShareButton from "./ShareButton"
import ActionButton from "./action-button/ActionButton"
import AboutCompany from "./main-content/AboutCompany"
import AboutLivestream from "./main-content/AboutLivestream"
import Jobs from "./main-content/Jobs"
import Questions from "./main-content/Questions"
import Section from "./main-content/Section"
import Speakers from "./main-content/Speakers"

const styles = sxStyles({
   liveHeroContent: {
      animation: `${boxShadowAnimation} 1s infinite alternate`,
   },
})

const LivestreamDetailsView = () => {
   const {
      livestream,
      livestreamPresenter,
      serverUserEmail,
      closeDialog,
      previousView,
      handleBack,
   } = useLiveStreamDialog()

   const { handleRegisterClick } = useRegistrationHandler()

   const [heroRef, heroInView] = useInView()

   const isMobile = useIsMobile()

   const viewRef = useTrackLivestreamView(livestream)
   const { authenticatedUser } = useAuth()

   const { showRecording } = useRecordingAccess(
      authenticatedUser.email || serverUserEmail,
      livestreamPresenter
   )

   const { count: jobsCount } = useCustomJobsCount({
      businessFunctionTagIds: [],
      livestreamId: livestreamPresenter.id,
   })

   const isFloatingActionButton = isMobile || !heroInView

   const hasJobs = livestreamPresenter.hasJobs && jobsCount > 0

   const handleBackClick = () => {
      if (previousView === "recommendations") {
         handleBack()
      } else {
         closeDialog()
      }
   }

   return (
      <BaseDialogView
         heroContent={
            <HeroContent
               sx={[livestreamPresenter.isLive() && styles.liveHeroContent]}
               ref={heroRef}
               backgroundImg={getResizedUrl(
                  livestream.backgroundImageUrl,
                  "lg"
               )}
               onBackPosition={
                  isMobile || previousView === "recommendations"
                     ? "top-left"
                     : "top-right"
               }
               onBackClick={handleBackClick}
            >
               <HeroTags />
               <ShareButton livestream={livestream} />
               <Stack
                  ref={viewRef}
                  alignItems="center"
                  justifyContent={"center"}
                  spacing={2.5}
                  width={"100%"}
               >
                  <HostInfo presenter={livestreamPresenter} />
                  <LivestreamTitle text={livestream.title} />
                  <LivestreamTagsContainer presenter={livestreamPresenter} />
                  {showRecording ? (
                     <RecordingPlayer
                        stream={livestream}
                        livestreamPresenter={livestreamPresenter}
                     />
                  ) : (
                     <CountDownTimer presenter={livestreamPresenter} />
                  )}
                  {!isFloatingActionButton && (
                     <ActionButton
                        livestreamPresenter={livestreamPresenter}
                        onRegisterClick={handleRegisterClick}
                        canWatchRecording={showRecording}
                        isFloating={isFloatingActionButton}
                        userEmailFromServer={serverUserEmail}
                        heroVisible={heroInView}
                     />
                  )}
               </Stack>
            </HeroContent>
         }
         mainContent={
            <>
               <MainContentNavigation
                  questionsDisabled={Boolean(livestream.questionsDisabled)}
                  hasJobs={hasJobs}
               >
                  {({
                     jobsRef,
                     aboutLivestreamRef,
                     aboutCompanyRef,
                     questionsRef,
                  }) => (
                     <MainContent>
                        <Section ref={aboutLivestreamRef}>
                           {/* Speakers are part of the about live stream section */}
                           <Speakers speakers={livestream.speakers} />
                           <Section navOffset={50}>
                              <AboutLivestream
                                 presenter={livestreamPresenter}
                              />
                           </Section>
                        </Section>
                        {hasJobs ? (
                           <Section navOffset={44} ref={jobsRef}>
                              <Jobs presenter={livestreamPresenter} />
                           </Section>
                        ) : null}
                        <AboutCompany
                           sectionRef={aboutCompanyRef}
                           presenter={livestreamPresenter}
                        />
                        {livestream.questionsDisabled ? null : (
                           <Section ref={questionsRef}>
                              <Questions livestream={livestream} />
                           </Section>
                        )}
                        {isFloatingActionButton ? (
                           <FloatingButtonOffset />
                        ) : null}
                     </MainContent>
                  )}
               </MainContentNavigation>
               {Boolean(isFloatingActionButton) && (
                  <ActionButton
                     livestreamPresenter={livestreamPresenter}
                     onRegisterClick={handleRegisterClick}
                     canWatchRecording={showRecording}
                     isFloating={isFloatingActionButton}
                     userEmailFromServer={serverUserEmail}
                     heroVisible={heroInView}
                  />
               )}
            </>
         }
      />
   )
}

const FloatingButtonOffset = () => <Box height={90} />

export default LivestreamDetailsView

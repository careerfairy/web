import { FC } from "react"
import BaseDialogView, { HeroContent, MainContent } from "../../BaseDialogView"
import { useLiveStreamDialog } from "../../LivestreamDialog"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Stack from "@mui/material/Stack"
import CountDownTimer from "./CountDownTimer"
import LivestreamTagsContainer from "./LivestreamTagsContainer"
import HostInfo from "./HostInfo"
import LivestreamTitle from "./LivestreamTitle"
import ActionButton from "./action-button/ActionButton"
import useRecordingAccess from "../../../upcoming-livestream/HeroSection/useRecordingAccess"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import RecordingPlayer from "./RecordingPlayer"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import ShareButton from "./ShareButton"
import { useInView } from "react-intersection-observer"
import MainContentNavigation from "./MainContentNavigation"
import Speakers from "./main-content/Speakers"
import AboutCompany from "./main-content/AboutCompany"
import AboutLivestream from "./main-content/AboutLivestream"
import Jobs from "./main-content/Jobs"
import Questions from "./main-content/Questions"
import Section from "./main-content/Section"
import Box from "@mui/material/Box"
import useRegistrationHandler from "../../useRegistrationHandler"
import HeroTags from "./HeroTags"
import { sxStyles } from "types/commonTypes"
import { boxShadowAnimation } from "materialUI/GlobalBackground/GlobalBackGround"

const styles = sxStyles({
   liveHeroContent: {
      animation: `${boxShadowAnimation} 1s infinite alternate`,
   },
})

const LivestreamDetailsView: FC = () => {
   const {
      livestream,
      livestreamPresenter,
      updatedStats,
      serverUserEmail,
      closeDialog,
   } = useLiveStreamDialog()

   const { handleRegisterClick } = useRegistrationHandler()

   const { authenticatedUser } = useAuth()
   const [heroRef, heroInView] = useInView()

   const isMobile = useIsMobile()

   const { showRecording, userHasBoughtRecording } = useRecordingAccess(
      authenticatedUser.email || serverUserEmail,
      livestreamPresenter,
      updatedStats
   )

   const hasJobs = livestreamPresenter.hasJobs()

   const isFloatingActionButton = isMobile || !heroInView

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
               onBackPosition={isMobile ? "top-left" : "top-right"}
               onBackClick={closeDialog}
            >
               <HeroTags />
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
                     isFloating={isFloatingActionButton}
                     userEmailFromServer={serverUserEmail}
                     heroVisible={heroInView}
                  />
               </Stack>
            </HeroContent>
         }
         mainContent={
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
                     {hasJobs ? (
                        <Section navOffset={44} ref={jobsRef}>
                           <Jobs presenter={livestreamPresenter} />
                        </Section>
                     ) : null}
                     <Section ref={aboutLivestreamRef}>
                        {/* Speakers are part of the about live stream section */}
                        <Speakers speakers={livestream.speakers} />
                        <Section>
                           <AboutLivestream presenter={livestreamPresenter} />
                        </Section>
                     </Section>
                     <AboutCompany
                        sectionRef={aboutCompanyRef}
                        presenter={livestreamPresenter}
                     />
                     {livestream.questionsDisabled ? null : (
                        <Section ref={questionsRef}>
                           <Questions livestream={livestream} />
                        </Section>
                     )}
                     {isFloatingActionButton ? <FloatingButtonOffset /> : null}
                  </MainContent>
               )}
            </MainContentNavigation>
         }
      />
   )
}

const FloatingButtonOffset = () => <Box height={90} />

export default LivestreamDetailsView

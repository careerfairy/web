import { CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import { appendCurrentQueryParams } from "components/util/url"
import { Fragment, useMemo } from "react"
import { getAgoraUserId } from "./util"

import { useAuth } from "HOCs/AuthProvider"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { useSpeakerId } from "store/selectors/streamingAppSelectors"
import { MiddleContentLayout } from "./components/MiddleContent/MiddleContentLayout"
import { LivestreamStateTrackers } from "./components/streaming/LivestreamStateTrackers"
import { WaitingRoom } from "./components/waiting-room/WaitingRoom"

const HostProfileSelection = dynamic(
   () =>
      import("./components/host-profile-selection/HostProfileSelection").then(
         (mod) => mod.HostProfileSelection
      ),
   { ssr: false }
)

const TutorialProvider = dynamic(
   () =>
      import("./components/tutorial/LivestreamTutorialProvider").then(
         (mod) => mod.LivestreamTutorialProvider
      ),
   { ssr: false }
)

const SnackbarNotificationsProvider = dynamic(
   () =>
      import(
         "./components/snackbar-notifications/SnackbarNotificationsProvider"
      ).then((mod) => mod.SnackbarNotificationsProvider),
   { ssr: false }
)

const EndOfStream = dynamic(
   () =>
      import("./components/end-of-stream/EndOfStream").then(
         (mod) => mod.EndOfStream
      ),
   { ssr: false }
)

const ShareVideoDialog = dynamic(
   () =>
      import(
         "./components/StreamingGrid/Spotlight/video/ShareVideoDialog"
      ).then((mod) => mod.ShareVideoDialog),
   { ssr: false }
)

const UploadPDFPresentationDialog = dynamic(
   () =>
      import(
         "./components/StreamingGrid/Spotlight/pdf/UploadPDFPresentationDialog"
      ).then((mod) => mod.UploadPDFPresentationDialog),
   { ssr: false }
)

const ThanksForJoiningHandRaiseDialog = dynamic(
   () =>
      import("./components/hand-raise/ThanksForJoiningHandRaiseDialog").then(
         (mod) => mod.ThanksForJoiningHandRaiseDialog
      ),
   { ssr: false }
)

const SessionConflictModal = dynamic(
   () =>
      import("./components/SessionConflictModal").then(
         (mod) => mod.SessionConflictModal
      ),
   { ssr: false }
)

const SessionDisconnectedModal = dynamic(
   () =>
      import("./components/SessionDisconnectedModal").then(
         (mod) => mod.SessionDisconnectedModal
      ),
   { ssr: false }
)

const LivestreamValidationWrapper = dynamic(
   () =>
      import("./components/LivestreamValidationWrapper").then(
         (mod) => mod.LivestreamValidationWrapper
      ),
   { ssr: false }
)

const AgoraDevicesProvider = dynamic(
   () =>
      import("./context/AgoraDevices").then((mod) => mod.AgoraDevicesProvider),
   { ssr: false }
)
const UserClientProvider = dynamic(
   () => import("./context/UserClient").then((mod) => mod.UserClientProvider),
   { ssr: false }
)
const RTMSignalingProvider = dynamic(
   () =>
      import("./context/RTMSignaling").then((mod) => mod.RTMSignalingProvider),
   {
      ssr: false,
   }
)

const Layout = dynamic(
   () => import("./components/Layout").then((mod) => mod.Layout),
   {
      ssr: false,
   }
)

/* const ToggleStreamModeButton = dynamic(
   () =>
      import("./components/ToggleStreamModeButton").then(
         (mod) => mod.ToggleStreamModeButton
      ),
   {
      ssr: false,
   }
) */
const StreamSetupWidget = dynamic(
   () =>
      import("./components/StreamSetupWidget").then(
         (mod) => mod.StreamSetupWidget
      ),
   {
      ssr: false,
   }
)
const SettingsMenu = dynamic(
   () => import("./components/SettingsMenu").then((mod) => mod.SettingsMenu),
   {
      ssr: false,
   }
)
const FeedbackQuestionsTracker = dynamic(
   () =>
      import("./components/feedback-questions/FeedbackQuestionsTracker").then(
         (mod) => mod.FeedbackQuestionsTracker
      ),
   {
      ssr: false,
   }
)
const TopBar = dynamic(
   () => import("./components/TopBar").then((mod) => mod.TopBar),
   {
      ssr: false,
   }
)
const MiddleContent = dynamic(
   () => import("./components/MiddleContent").then((mod) => mod.MiddleContent),
   {
      ssr: false,
      loading: () => <MiddleContentLayout />,
   }
)
const BottomBar = dynamic(
   () => import("./components/BottomBar").then((mod) => mod.BottomBar),
   {
      ssr: false,
   }
)
const StreamingProvider = dynamic(
   () => import("./context/Streaming").then((mod) => mod.StreamingProvider),
   { ssr: false }
)
const ScreenShareProvider = dynamic(
   () => import("./context/ScreenShare").then((mod) => mod.ScreenShareProvider),
   { ssr: false }
)

const LocalTracksProvider = dynamic(
   () => import("./context/LocalTracks").then((mod) => mod.LocalTracksProvider),
   { ssr: false }
)

const AgoraTrackers = dynamic(
   () =>
      import("./components/streaming/AgoraTrackers").then(
         (mod) => mod.AgoraTrackers
      ),
   { ssr: false }
)

const ViewerTrackers = dynamic(
   () =>
      import("./components/ViewerTrackers").then((mod) => mod.ViewerTrackers),
   { ssr: false }
)

const HostTrackers = dynamic(
   () => import("./components/HostTrackers").then((mod) => mod.HostTrackers),
   { ssr: false }
)

const OngoingPollTracker = dynamic(
   () =>
      import("./components/streaming/OngoingPollTracker").then(
         (mod) => mod.OngoingPollTracker
      ),
   { ssr: false }
)

const EmotesRenderer = dynamic(
   () =>
      import("./components/emotes/EmotesRenderer").then(
         (mod) => mod.EmotesRenderer
      ),
   { ssr: false }
)

type Props = {
   isHost: boolean
}

export const StreamingPage = ({ isHost }: Props) => {
   const { authenticatedUser } = useAuth()

   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <ConditionalWrapper condition={authenticatedUser.isLoaded}>
            <LivestreamValidationWrapper isHost={isHost}>
               <Component isHost={isHost} />
            </LivestreamValidationWrapper>
         </ConditionalWrapper>
      </SuspenseWithBoundary>
   )
}

const Component = ({ isHost }: Props) => {
   const livestream = useLivestreamData()
   const { authenticatedUser } = useAuth()
   const { query } = useRouter()
   const speakerId = useSpeakerId()

   useConditionalRedirect(
      livestream.useOldUI,
      appendCurrentQueryParams(
         `/streaming/${livestream.id}/${isHost ? "main-streamer" : "viewer"}`
      )
   )

   const agoraUserId = getAgoraUserId({
      isRecordingWindow: Boolean(query.isRecordingWindow),
      useTempId: livestream.openStream && !isHost, // Use a temporary ID for viewers of open streams
      streamId: livestream.id,
      userId: authenticatedUser.uid,
      speakerId,
   })

   /**
    * The children are wrapped in useMemo to ensure that they are only re-rendered when necessary.
    * This is because React.memo does not optimize for inline JSX children, hence the need for useMemo.
    */
   return useMemo(
      () => (
         <>
            <WaitingRoom isHost={isHost}>
               <UserClientProvider>
                  <StreamingProvider
                     isHost={isHost}
                     agoraUserId={agoraUserId}
                     livestreamId={livestream.id}
                  >
                     <HostProfileSelection isHost={isHost}>
                        <RTMSignalingProvider>
                           <SnackbarNotificationsProvider>
                              <AgoraDevicesProvider>
                                 <LocalTracksProvider>
                                    <ScreenShareProvider>
                                       <TutorialProvider>
                                          <EndOfStream isHost={isHost}>
                                             <Layout>
                                                <Fragment>
                                                   <TopBar />
                                                   <MiddleContent />
                                                   <BottomBar />
                                                   <StreamSetupWidget />
                                                   <SettingsMenu />
                                                </Fragment>
                                             </Layout>
                                          </EndOfStream>
                                       </TutorialProvider>

                                       {/* <ToggleStreamModeButton /> */}
                                    </ScreenShareProvider>
                                 </LocalTracksProvider>
                              </AgoraDevicesProvider>
                              <AgoraTrackers />
                              {isHost ? <HostTrackers /> : <ViewerTrackers />}
                              {isHost ? null : <OngoingPollTracker />}
                              {isHost ? null : (
                                 <ThanksForJoiningHandRaiseDialog />
                              )}
                              {isHost ? <UploadPDFPresentationDialog /> : null}
                              {isHost ? <ShareVideoDialog /> : null}
                              {!isHost && authenticatedUser ? (
                                 <FeedbackQuestionsTracker />
                              ) : null}
                              <EmotesRenderer />
                              <SessionConflictModal />
                              <SessionDisconnectedModal />
                           </SnackbarNotificationsProvider>
                        </RTMSignalingProvider>
                     </HostProfileSelection>
                  </StreamingProvider>
               </UserClientProvider>
            </WaitingRoom>
            <LivestreamStateTrackers />
         </>
      ),
      [agoraUserId, isHost, livestream.id, authenticatedUser]
   )
}

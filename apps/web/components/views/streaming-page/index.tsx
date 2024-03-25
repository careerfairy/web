import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import { appendCurrentQueryParams } from "components/util/url"
import { Fragment, useMemo } from "react"
import { CircularProgress } from "@mui/material"
import { getAgoraUserId } from "./util"

import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import dynamic from "next/dynamic"
import { LivestreamStateTrackers } from "./components/streaming/LivestreamStateTrackers"

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

const ToggleStreamModeButton = dynamic(
   () =>
      import("./components/ToggleStreamModeButton").then(
         (mod) => mod.ToggleStreamModeButton
      ),
   {
      ssr: false,
   }
)
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

   useConditionalRedirect(
      !livestream.useNewUI,
      appendCurrentQueryParams(
         `/streaming/${livestream.id}/${isHost ? "main-streamer" : "viewer"}`
      )
   )

   const agoraUserId = getAgoraUserId({
      isRecordingWindow: Boolean(query.isRecordingWindow),
      useTempId: livestream.openStream && !isHost, // Use a temporary ID for viewers of open streams
      streamId: livestream.id,
      userId: authenticatedUser.uid,
      creatorId: "", // TODO: CreatorID goes here once we introduce the select logic
   })

   /**
    * The children are wrapped in useMemo to ensure that they are only re-rendered when necessary.
    * This is because React.memo does not optimize for inline JSX children, hence the need for useMemo.
    */
   return useMemo(
      () => (
         <UserClientProvider>
            <StreamingProvider
               isHost={isHost}
               agoraUserId={agoraUserId}
               livestreamId={livestream.id}
            >
               <RTMSignalingProvider>
                  <AgoraDevicesProvider>
                     <LocalTracksProvider>
                        <ScreenShareProvider>
                           <Layout>
                              <Fragment>
                                 <TopBar />
                                 <MiddleContent />
                                 <BottomBar />
                                 <StreamSetupWidget />
                                 <SettingsMenu />
                              </Fragment>
                           </Layout>
                           <ToggleStreamModeButton />
                        </ScreenShareProvider>
                     </LocalTracksProvider>
                  </AgoraDevicesProvider>
                  <AgoraTrackers />
                  <LivestreamStateTrackers />
               </RTMSignalingProvider>
            </StreamingProvider>
         </UserClientProvider>
      ),
      [agoraUserId, isHost, livestream.id]
   )
}

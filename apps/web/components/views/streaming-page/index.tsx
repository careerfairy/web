import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import { appendCurrentQueryParams } from "components/util/url"
import { BottomBar, Layout, TopBar } from "./components"
import { MiddleContent } from "./components/MiddleContent"
import { ToggleStreamModeButton } from "./components/ToggleStreamModeButton"
import {
   StreamingProvider,
   UserClientProvider,
   LocalTracksProvider,
} from "./context"
import { Fragment, useMemo } from "react"
import { CircularProgress } from "@mui/material"
import { StreamSetupWidget } from "./components/StreamSetupWidget"
import {
   GetUserStreamIdOptions,
   getAgoraUserId,
   withLocalStorage,
} from "./util"
import { useAuth } from "HOCs/AuthProvider"
import { useRouter } from "next/router"
import { LivestreamValidationWrapper } from "./components/LivestreamValidationWrapper"

type Props = {
   isHost: boolean
}

export const StreamingPage = ({ isHost }: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <LivestreamValidationWrapper isHost={isHost}>
            <Component isHost={isHost} />
         </LivestreamValidationWrapper>
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

   const options: GetUserStreamIdOptions = {
      isRecordingWindow: Boolean(query.isRecordingWindow),
      useRandomId: livestream.openStream || isHost,
      streamId: livestream.id,
      userId: authenticatedUser.email,
   }

   const agoraUserId = isHost
      ? withLocalStorage("streamingUuid", () => getAgoraUserId(options))
      : getAgoraUserId(options)

   /**
    * The children are wrapped in useMemo to ensure that they are only re-rendered when necessary.
    * This is because React.memo does not optimize for inline JSX children, hence the need for useMemo.
    */
   const memoizedChildren = useMemo(
      () => (
         <Fragment>
            <TopBar />
            <MiddleContent />
            <BottomBar />
            <StreamSetupWidget />
         </Fragment>
      ),
      []
   )

   return (
      <UserClientProvider>
         <StreamingProvider
            isHost={isHost}
            agoraUserId={agoraUserId}
            livestreamId={livestream.id}
         >
            <LocalTracksProvider>
               <Layout>{memoizedChildren}</Layout>
               <ToggleStreamModeButton />
            </LocalTracksProvider>
         </StreamingProvider>
      </UserClientProvider>
   )
}

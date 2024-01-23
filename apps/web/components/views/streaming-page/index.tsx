import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamData } from "components/custom-hook/streaming/useLivestreamData"
import { useConditionalRedirect } from "components/custom-hook/useConditionalRedirect"
import { appendCurrentQueryParams } from "components/util/url"
import { BottomBar, Layout, TopBar } from "./components"
import { MiddleContent } from "./components/MiddleContent"
import { ToggleStreamModeButton } from "./components/ToggleStreamModeButton"
import { StreamProvider } from "./context"
import { Fragment, ReactNode, useMemo } from "react"
import { CircularProgress } from "@mui/material"

type Props = {
   isHost: boolean
}

export const StreamingPage = ({ isHost }: Props) => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <LivestreamNotFoundRedirectWrapper>
            <Component isHost={isHost} />
         </LivestreamNotFoundRedirectWrapper>
      </SuspenseWithBoundary>
   )
}
export const Component = ({ isHost }: Props) => {
   const livestream = useLivestreamData()

   useConditionalRedirect(
      !livestream.useNewUI,
      appendCurrentQueryParams(
         `/streaming/${livestream.id}/${isHost ? "main-streamer" : "viewer"}`
      )
   )

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
         </Fragment>
      ),
      []
   )

   return (
      <StreamProvider isHost={isHost} livestreamId={livestream.id}>
         <Layout>{memoizedChildren}</Layout>
         <ToggleStreamModeButton />
      </StreamProvider>
   )
}

type ConditionalRedirectWrapperProps = {
   children: ReactNode
}

/**
 * Ensures children components render only with live stream data available, redirecting otherwise.
 */
export const LivestreamNotFoundRedirectWrapper = ({
   children,
}: ConditionalRedirectWrapperProps) => {
   const livestream = useLivestreamData()

   const livestreamExists = Boolean(livestream)

   useConditionalRedirect(!livestreamExists, "/portal")

   if (!livestreamExists) return null

   return <>{children}</>
}

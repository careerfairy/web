import { CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamPolls } from "components/custom-hook/streaming/useLivestreamPolls"
import React from "react"
import { useStreamingContext } from "../../context"
import { PollCreationButton } from "./PollCreationButton"

export const PollsView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId, isHost } = useStreamingContext()
   const { data: polls } = useLivestreamPolls(livestreamId)
   const hasPolls = polls.length > 0
   console.log("🚀 ~ file: PollsView.tsx:20 ~ Content ~ hasPolls:", hasPolls)

   return <div>{isHost ? <PollCreationButton /> : null}</div>
}

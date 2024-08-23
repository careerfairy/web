import { Box, Collapse, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamActiveCTA } from "components/custom-hook/streaming/call-to-action/useLivestreamActiveCTA"
import { Fragment } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { CTAHostCardSkeleton, CTAViewerCardSkeleton } from "./CTACardSkeleton"
import { CTAViewerCard } from "./CTAViewerCard"

export const ViewerCTAView = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId } = useStreamingContext()
   const { data: activeCTA } = useLivestreamActiveCTA(livestreamId)

   return (
      <Fragment>
         <Stack spacing={1} component={TransitionGroup}>
            {activeCTA.map((cta) => (
               <Collapse key={cta.id}>
                  <Box>
                     <SuspenseWithBoundary fallback={<CTAHostCardSkeleton />}>
                        <CTAViewerCard cta={cta} />
                     </SuspenseWithBoundary>
                  </Box>
               </Collapse>
            ))}
         </Stack>
      </Fragment>
   )
}

const Loader = () => {
   return (
      <Stack spacing={1}>
         <CTAViewerCardSkeleton />
         <CTAViewerCardSkeleton />
      </Stack>
   )
}

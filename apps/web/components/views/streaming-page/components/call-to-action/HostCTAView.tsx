import { Box, Collapse, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useLivestreamCTA } from "components/custom-hook/streaming/call-to-action/useLivestreamCTA"
import { Fragment, useState } from "react"
import { TransitionGroup } from "react-transition-group"
import { useStreamingContext } from "../../context"
import { CTACard } from "./CTACard"
import { CTACardSkeleton } from "./CTACardSkeleton"
import { CTACreationButton } from "./CTACreationButton"
import { ConfirmDeleteCTADialog } from "./ConfirmDeleteCTADialog"
import { EmptyCTAView } from "./EmptyCTAView"

export const HostCTAView = () => {
   return (
      <SuspenseWithBoundary fallback={<Loader />}>
         <Content />
      </SuspenseWithBoundary>
   )
}

const Content = () => {
   const { livestreamId } = useStreamingContext()
   const { data: ctaData } = useLivestreamCTA(livestreamId)
   const [isCreateCTAFormOpen, setIsCreateCTAFormOpen] =
      useState<boolean>(false)
   const [ctaIdToDelete, setCTAIdToDelete] = useState<string | null>(null)

   const handleOpenCTADeleteDialog = (ctaId: string) => {
      setCTAIdToDelete(ctaId)
   }

   const handleCloseCTADeleteDialog = () => {
      setCTAIdToDelete(null)
   }

   const hasCTA = ctaData.length > 0

   if (!hasCTA && !isCreateCTAFormOpen) {
      return <EmptyCTAView onCreateClick={() => setIsCreateCTAFormOpen(true)} />
   }

   return (
      <Fragment>
         <Stack spacing={1.5}>
            <CTACreationButton
               setIsCreateCTAFormOpen={setIsCreateCTAFormOpen}
               isCreateCTAFormOpen={isCreateCTAFormOpen}
               hasCTA={hasCTA}
            />
            <Stack spacing={1} component={TransitionGroup}>
               {ctaData.map((cta) => (
                  <Collapse key={cta.id}>
                     <Box>
                        <SuspenseWithBoundary fallback={<CTACardSkeleton />}>
                           <CTACard
                              cta={cta}
                              onClickDelete={handleOpenCTADeleteDialog}
                           />
                        </SuspenseWithBoundary>
                     </Box>
                  </Collapse>
               ))}
            </Stack>
         </Stack>
         <ConfirmDeleteCTADialog
            open={Boolean(ctaIdToDelete)}
            onClose={handleCloseCTADeleteDialog}
            ctaId={ctaIdToDelete}
         />
      </Fragment>
   )
}

const Loader = () => {
   return (
      <Stack spacing={1}>
         <CTACardSkeleton />
         <CTACardSkeleton />
      </Stack>
   )
}

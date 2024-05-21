import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { Box, CircularProgress } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAppDispatch } from "components/custom-hook/store"
import { useLivestreamPDFPresentation } from "components/custom-hook/streaming/useLivestreamPDFPresentation"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { useStreamingContext } from "components/views/streaming-page/context"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"
import { useState } from "react"
import { Upload } from "react-feather"
import { setUploadPDFPresentationDialogOpen } from "store/reducers/streamingAppReducer"
import { useUploadPDFPresentationDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { PDFPresentationManager } from "./PDFPresentationManager"

const styles = sxStyles({
   icon: {
      color: "primary.main",
      width: "48px !important",
      height: "48px !important",
   },
   loader: {
      m: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

export const UploadPDFPresentationDialog = () => {
   const settingsMenuOpen = useUploadPDFPresentationDialogOpen()

   const { livestreamId } = useStreamingContext()
   const { data: pdfPresentation } = useLivestreamPDFPresentation(livestreamId)
   const { trigger: setLivestreamMode, isMutating } =
      useSetLivestreamMode(livestreamId)
   const [readyToShare, setReadyToShare] = useState(false)

   const dispatch = useAppDispatch()

   const closeMenu = () => {
      setReadyToShare(false)
      dispatch(setUploadPDFPresentationDialogOpen(false))
   }

   return (
      <ConfirmationDialog
         width={589}
         open={settingsMenuOpen}
         title="Upload your PDF"
         description="Upload your PDF to share your slides with the audience"
         icon={<Box component={Upload} sx={styles.icon} />}
         secondaryAction={{
            text: "Cancel",
            color: "grey",
            callback: () => closeMenu(),
            variant: "outlined",
         }}
         primaryAction={{
            text: "Share slides",
            color: "primary",
            disabled: !pdfPresentation?.downloadUrl || !readyToShare,
            callback: () =>
               setLivestreamMode({
                  mode: LivestreamModes.PRESENTATION,
               }).then(closeMenu),
            variant: "contained",
            loading: isMutating,
         }}
         additionalContent={
            <SuspenseWithBoundary fallback={<Loader />}>
               <PDFPresentationManager
                  pdfPresentation={pdfPresentation}
                  livestreamId={livestreamId}
                  setReadyToShare={setReadyToShare}
                  readyToShare={readyToShare}
               />
            </SuspenseWithBoundary>
         }
      />
   )
}

const Loader = () => {
   return (
      <Box sx={styles.loader}>
         <CircularProgress />
      </Box>
   )
}

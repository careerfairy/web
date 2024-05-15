import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { LoadingButton } from "@mui/lab"
import {
   Box,
   CircularProgress,
   Dialog,
   DialogActions,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useLivestreamPDFPresentation } from "components/custom-hook/streaming/useLivestreamPDFPresentation"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { PDFIcon } from "components/views/common/icons"
import { useStreamingContext } from "components/views/streaming-page/context"
import { setUploadPDFPresentationDialogOpen } from "store/reducers/streamingAppReducer"
import { useUploadPDFPresentationDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { PDFPresentationManager } from "./PDFPresentationManager"

const styles = sxStyles({
   dialog: {
      "& .MuiDialog-paper": {
         minWidth: 589,
         maxWidth: 589,
      },
   },
   drawer: {
      "& .MuiDrawer-paper": {
         borderTopLeftRadius: 12,
         borderTopRightRadius: 12,
         maxHeight: "calc(100vh - 40px)",
      },
   },
   container: {
      p: { xs: 2, md: 4 },
      position: "relative",
   },
   header: {
      mb: 4,
   },
   actions: {
      mt: 4,
      position: "sticky",
      bottom: 0,
      "& button": {
         width: 150,
      },
   },
   actionsMobile: {
      backgroundColor: "white",
      borderTop: "1px solid",
      borderColor: "neutral.50",
      mx: -2,
      mb: -2,
   },
   icon: {
      width: 84,
      height: 84,
      color: "primary.main",
   },
   loader: {
      m: "auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
})

export const UploadPDFPresentationDialog = () => {
   const isMobile = useStreamIsMobile()

   const settingsMenuOpen = useUploadPDFPresentationDialogOpen()

   const dispatch = useAppDispatch()

   const closeMenu = () => {
      dispatch(setUploadPDFPresentationDialogOpen(false))
   }

   if (isMobile) {
      return (
         <SwipeableDrawer
            open={settingsMenuOpen}
            sx={styles.drawer}
            anchor="bottom"
            onClose={closeMenu}
            onOpen={closeMenu}
         >
            <SuspenseWithBoundary fallback={<Loader />}>
               <Content isMobile={isMobile} onClose={closeMenu} />
            </SuspenseWithBoundary>
         </SwipeableDrawer>
      )
   }

   return (
      <Dialog
         maxWidth={false}
         sx={styles.dialog}
         onClose={closeMenu}
         open={settingsMenuOpen}
         TransitionProps={{ unmountOnExit: true }}
      >
         <SuspenseWithBoundary fallback={<Loader />}>
            <Content isMobile={isMobile} onClose={closeMenu} />
         </SuspenseWithBoundary>
      </Dialog>
   )
}

type ContentProps = {
   onClose: () => void
   isMobile: boolean
}

const Content = ({ onClose, isMobile }: ContentProps) => {
   const { livestreamId } = useStreamingContext()
   const { data: pdfPresentation } = useLivestreamPDFPresentation(livestreamId)
   const { trigger: setLivestreamMode, isMutating } =
      useSetLivestreamMode(livestreamId)

   return (
      <Box sx={styles.container}>
         <Stack
            sx={styles.header}
            spacing={1}
            alignItems="center"
            justifyContent="center"
         >
            <PDFIcon sx={styles.icon} />
            <Typography
               variant="desktopBrandedH3"
               fontWeight={700}
               color="neutral.800"
            >
               Upload your PDF
            </Typography>
         </Stack>
         <PDFPresentationManager
            pdfPresentation={pdfPresentation}
            livestreamId={livestreamId}
         />
         <Stack
            component={DialogActions}
            sx={[styles.actions, isMobile && styles.actionsMobile]}
            justifyContent={isMobile ? "flex-end" : "center"}
            direction="row"
            spacing={1.25}
         >
            <LoadingButton onClick={onClose} variant="outlined" color="grey">
               Cancel
            </LoadingButton>
            <LoadingButton
               variant="contained"
               color="primary"
               disabled={!pdfPresentation?.downloadUrl}
               loading={isMutating}
               onClick={() =>
                  setLivestreamMode({
                     mode: LivestreamModes.PRESENTATION,
                  }).then(onClose)
               }
            >
               Share slides
            </LoadingButton>
         </Stack>
      </Box>
   )
}

const Loader = () => {
   return (
      <Box sx={styles.loader}>
         <CircularProgress />
      </Box>
   )
}

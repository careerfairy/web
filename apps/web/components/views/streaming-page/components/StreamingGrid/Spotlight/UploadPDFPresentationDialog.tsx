import { LoadingButton } from "@mui/lab"
import {
   Box,
   Dialog,
   DialogActions,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
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
            <Content isMobile={isMobile} onClose={closeMenu} />
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
         <Content isMobile={isMobile} onClose={closeMenu} />
      </Dialog>
   )
}

type ContentProps = {
   onClose: () => void
   isMobile: boolean
}

const Content = ({ onClose, isMobile }: ContentProps) => {
   const { livestreamId } = useStreamingContext()

   const cancel = () => {
      onClose()
   }

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
         <PDFPresentationManager livestreamId={livestreamId} />
         <Stack
            component={DialogActions}
            sx={[styles.actions, isMobile && styles.actionsMobile]}
            justifyContent={isMobile ? "flex-end" : "center"}
            direction="row"
            spacing={1.25}
         >
            <LoadingButton onClick={cancel} variant="outlined" color="grey">
               Cancel
            </LoadingButton>
            <LoadingButton
               variant="contained"
               color="primary"
               onClick={() => alert("Not implemented")}
            >
               Share slides
            </LoadingButton>
         </Stack>
      </Box>
   )
}

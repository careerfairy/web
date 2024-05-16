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
import { useStreamingContext } from "components/views/streaming-page/context"
import { Youtube } from "react-feather"
import { setShareYoutubeVideoDialogOpen } from "store/reducers/streamingAppReducer"
import { useShareYoutubeVideoDialogOpen } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

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

export const ShareYoutubeVideoDialog = () => {
   const isMobile = useStreamIsMobile()

   const settingsMenuOpen = useShareYoutubeVideoDialogOpen()

   const dispatch = useAppDispatch()

   const closeMenu = () => {
      dispatch(setShareYoutubeVideoDialogOpen(false))
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
   console.log(
      "🚀 ~ file: ShareYoutubeVideoDialog.tsx:112 ~ Content ~ livestreamId:",
      livestreamId
   )

   return (
      <Box sx={styles.container}>
         <Stack
            sx={styles.header}
            spacing={1}
            alignItems="center"
            justifyContent="center"
         >
            <Box component={Youtube} sx={styles.icon} />
            <Stack spacing={0.75} justifyContent="center" alignItems="center">
               <Typography
                  variant="desktopBrandedH3"
                  fontWeight={700}
                  color="neutral.800"
               >
                  Share a video
               </Typography>

               <Typography
                  variant="medium"
                  color="neutral.700"
                  textAlign="center"
               >
                  {`When sharing a video, the player actions (play, pause, etc) will be replayed
on the viewer's screens as well.`}
               </Typography>
            </Stack>
         </Stack>
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
               onClick={
                  () => alert("Share video")
                  // share video
                  // close dialog
               }
            >
               Share video
            </LoadingButton>
         </Stack>
      </Box>
   )
}

import CloseIcon from "@mui/icons-material/Close"
import {
   Box,
   Button,
   CircularProgress,
   Dialog,
   Divider,
   IconButton,
   Stack,
   SwipeableDrawer,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import { useAuth } from "HOCs/AuthProvider"
import PropTypes from "prop-types"
import { useEffect, useMemo, useState } from "react"
import { Copy, ExternalLink } from "react-feather"
import { useCopyToClipboard } from "react-use"
import { sxStyles } from "types/commonTypes"
import { makeLivestreamUrl } from "util/makeUrls"

const styles = sxStyles({
   root: {
      display: "flex",
      padding: "24px 0px",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
   },
   drawer: {
      borderRadius: "12px 12px 0 0",
      maxHeight: "90%",
   },
   container: {
      padding: "0px 24px",
      alignItems: "center",
      gap: "16px",
      alignSelf: "stretch",
   },
   title: (theme) => ({
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "4px",
      alignSelf: "stretch",
      color: theme.palette.neutral[800],
      fontWeight: 700,
   }),
   copyButton: (theme) => ({
      cursor: "pointer",
      color: theme.palette.neutral[500],
   }),
   copiedInput: (theme) => ({
      borderColor: `${theme.palette.success[700]} !important`,
      backgroundColor: "#F3FBF6 !important",
   }),
   copiedText: (theme) => ({
      "& span": {
         color: `${theme.palette.success[700]} !important`,
      },
   }),
})

const StreamerLinksDialogContent = ({
   livestreamId,
   handleClose,
   firebase,
}) => {
   const [secureToken, setSecureToken] = useState(null)
   const [copyToClipboardState, copyToClipboard] = useCopyToClipboard()
   const { userData } = useAuth()

   useEffect(() => {
      if (livestreamId) {
         firebase.getLivestreamSecureToken(livestreamId).then((doc) => {
            if (doc.exists) {
               const secureToken: string = doc.data().value
               setSecureToken(secureToken)
            }
         })
      }
   }, [livestreamId, firebase])

   const hostLink = useMemo(
      () =>
         makeLivestreamUrl(livestreamId, {
            type: "host",
            token: secureToken,
         }),
      [livestreamId, secureToken]
   )
   const viewerLink = useMemo(
      () =>
         makeLivestreamUrl(livestreamId, {
            type: "viewer",
            referralCode: userData.referralCode,
            inviteCode: livestreamId,
         }),
      [livestreamId, userData.referralCode]
   )

   const hasCopiedHost = copyToClipboardState?.value === hostLink
   const hasCopiedViewer = copyToClipboardState?.value === viewerLink

   return (
      <Box sx={styles.root}>
         <Stack sx={styles.container}>
            <Box sx={styles.title}>
               <Typography variant="brandedH4">Ready to go?</Typography>
               <IconButton
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
               >
                  <CloseIcon />
               </IconButton>
            </Box>
            {livestreamId ? (
               <Stack gap={2.5} alignSelf="stretch">
                  <Stack gap={1.5}>
                     <Stack gap={0.5}>
                        <Typography variant="brandedBody" color="neutral.700">
                           Send this link to other streamers!
                        </Typography>
                        <BrandedTextField
                           label={
                              hasCopiedHost ? "Link copied!" : "Streamer link"
                           }
                           value={hostLink}
                           InputProps={{
                              endAdornment: (
                                 <Box
                                    component={Copy}
                                    sx={styles.copyButton}
                                    onClick={() => copyToClipboard(hostLink)}
                                 />
                              ),
                              readOnly: true,
                              sx: hasCopiedHost ? styles.copiedInput : {},
                           }}
                           InputLabelProps={{
                              sx: hasCopiedHost ? styles.copiedText : {},
                           }}
                        />
                     </Stack>
                     <Stack gap={0.5}>
                        <Typography variant="brandedBody" color="neutral.700">
                           Share the stream with your audience!
                        </Typography>
                        <BrandedTextField
                           label={
                              hasCopiedViewer ? "Link copied!" : "Viewer link"
                           }
                           value={viewerLink}
                           InputProps={{
                              endAdornment: (
                                 <Box
                                    component={Copy}
                                    sx={styles.copyButton}
                                    onClick={() => copyToClipboard(viewerLink)}
                                 />
                              ),
                              sx: hasCopiedViewer ? styles.copiedInput : {},
                           }}
                           InputLabelProps={{
                              sx: hasCopiedViewer ? styles.copiedText : {},
                           }}
                        />
                     </Stack>
                  </Stack>
                  <Divider sx={{ width: "100%" }} />
                  <Button
                     variant="contained"
                     fullWidth
                     endIcon={<ExternalLink />}
                     href={hostLink}
                     target="_blank"
                  >
                     Enter live stream room
                  </Button>
               </Stack>
            ) : (
               <CircularProgress />
            )}
         </Stack>
      </Box>
   )
}

StreamerLinksDialogContent.propTypes = {
   handleClose: PropTypes.func,
   livestreamId: PropTypes.string,
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
}

const StreamerLinksDialog = ({
   firebase,
   livestreamId,
   openDialog,
   onClose,
}) => {
   const isMobile = useIsMobile()
   const handleClose = () => {
      onClose?.()
   }

   if (isMobile) {
      return (
         <SwipeableDrawer
            open={openDialog}
            onClose={handleClose}
            onOpen={() => {}}
            anchor="bottom"
            PaperProps={{
               sx: styles.drawer,
            }}
         >
            <StreamerLinksDialogContent
               livestreamId={livestreamId}
               handleClose={handleClose}
               firebase={firebase}
            />
         </SwipeableDrawer>
      )
   }

   return (
      <Dialog
         open={openDialog}
         onClose={handleClose}
         fullWidth={true}
         maxWidth={"md"}
         aria-labelledby="form-dialog-title"
      >
         <StreamerLinksDialogContent
            livestreamId={livestreamId}
            handleClose={handleClose}
            firebase={firebase}
         />
      </Dialog>
   )
}

StreamerLinksDialog.propTypes = {
   firebase: PropTypes.shape({
      getLivestreamSecureToken: PropTypes.func,
   }),
   onClose: PropTypes.func,
   livestreamId: PropTypes.string,
   openDialog: PropTypes.bool,
   setOpenDialog: PropTypes.func,
}

export default withFirebase(StreamerLinksDialog)

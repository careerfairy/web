import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
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
import { SlideUpTransition } from "components/views/common/transitions"
import { livestreamService } from "data/firebase/LivestreamService"
import { useEffect, useMemo, useState } from "react"
import { Copy, ExternalLink } from "react-feather"
import { useCopyToClipboard } from "react-use"
import { sxStyles } from "types/commonTypes"
import {
   makeLivestreamEventDetailsShareUrl,
   makeLivestreamUrl,
} from "util/makeUrls"

const styles = sxStyles({
   root: {
      display: "flex",
      padding: "24px 0px",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
   },
   dialog: {
      maxWidth: 658,
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
   link: {
      "& .MuiInputBase-input": {
         overflow: "hidden",
         textOverflow: "ellipsis",
      },
   },
   copyButton: (theme) => ({
      cursor: "pointer",
      color: theme.palette.neutral[500],
      ml: 1,
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

type Props = {
   livestreamId: string
   companyName: string
   companyCountryCode?: string
   openDialog: boolean
   onClose: () => void
}

export const StreamerLinksDialog = ({
   livestreamId,
   companyName,
   companyCountryCode,
   openDialog,
   onClose,
}: Props) => {
   const isMobile = useIsMobile()

   if (isMobile) {
      return (
         <SwipeableDrawer
            open={openDialog}
            onClose={onClose}
            onOpen={() => {}}
            anchor="bottom"
            PaperProps={{
               sx: styles.drawer,
            }}
         >
            <StreamerLinksDialogContent
               livestreamId={livestreamId}
               onClose={onClose}
               companyName={companyName}
               companyCountryCode={companyCountryCode}
            />
         </SwipeableDrawer>
      )
   }

   return (
      <Dialog
         open={openDialog}
         onClose={onClose}
         fullWidth={true}
         maxWidth={"md"}
         aria-labelledby="form-dialog-title"
         PaperProps={{
            sx: styles.dialog,
         }}
         TransitionComponent={SlideUpTransition}
      >
         <StreamerLinksDialogContent
            livestreamId={livestreamId}
            onClose={onClose}
            companyName={companyName}
            companyCountryCode={companyCountryCode}
         />
      </Dialog>
   )
}

const StreamerLinksDialogContent = ({
   livestreamId,
   companyName,
   companyCountryCode,
   onClose,
}: Omit<Props, "openDialog">) => {
   const [secureToken, setSecureToken] = useState<string | null>(null)
   const [copyToClipboardState, copyToClipboard] = useCopyToClipboard()

   useEffect(() => {
      if (livestreamId) {
         livestreamService
            .getLivestreamSecureToken(livestreamId)
            .then(setSecureToken)
      }
   }, [livestreamId])

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
         makeLivestreamEventDetailsShareUrl(livestreamId, {
            utm_source: "client",
            utm_campaign: "events",
            utm_content: (
               companyNameSlugify(companyName) +
               (companyCountryCode ? `-${companyCountryCode}` : "")
            ).toLowerCase(),
         }).toString(),
      [livestreamId, companyCountryCode, companyName]
   )

   const hasCopiedHost = copyToClipboardState?.value === hostLink
   const hasCopiedViewer = copyToClipboardState?.value === viewerLink

   return (
      <Box sx={styles.root}>
         <Stack sx={styles.container}>
            <Box sx={styles.title}>
               <Typography variant="brandedH4">Ready to go?</Typography>
               <IconButton color="inherit" onClick={onClose} aria-label="close">
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
                              sx: [
                                 styles.link,
                                 hasCopiedHost && styles.copiedInput,
                              ],
                           }}
                           InputLabelProps={{
                              sx: hasCopiedHost ? styles.copiedText : {},
                           }}
                        />
                     </Stack>
                     <Stack gap={0.5}>
                        <Typography variant="brandedBody" color="neutral.700">
                           Promote your live stream with your talent community!
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
                              sx: [
                                 styles.link,
                                 hasCopiedViewer && styles.copiedInput,
                              ],
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
                     color="secondary"
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

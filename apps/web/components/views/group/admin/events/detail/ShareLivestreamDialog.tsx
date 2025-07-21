import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Button, Stack } from "@mui/material"
import { Copy, Linkedin } from "react-feather"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import { useCallback, useMemo } from "react"
import { useCopyToClipboard } from "react-use"
import { useSnackbar } from "notistack"
import { makeLivestreamEventDetailsInviteUrl } from "util/makeUrls"
import { useAuth } from "HOCs/AuthProvider"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { dataLayerEvent } from "util/analyticsUtils"

const styles = sxStyles({
   wrapContainer: {
      height: "489px",
      width: "517px",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      px: 2,
   },
   content: {
      my: 1,
   },
   info: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
   },
   title: {
      fontSize: "1.28571rem", // 18px - Desktop Heading 5
      fontWeight: 700,
      color: "neutral.800",
      lineHeight: 1.55556,
   },
   subtitle: {
      fontSize: "1.14286rem", // 16px - Desktop body regular
      fontWeight: 400,
      color: "neutral.700",
      lineHeight: 1.5,
      textAlign: "center",
      mt: 1,
   },
   linkField: {
      width: "100%",
      mt: 2,
   },
   actions: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      gap: 2,
      mt: 3,
   },
   actionBtn: {
      width: "160px",
      height: "40px",
      textTransform: "none",
      fontWeight: 600,
   },
   copyBtn: {
      backgroundColor: (theme) => theme.brand.white[50],
      color: "neutral.800",
      border: "1px solid",
      borderColor: "neutral.200",
      "&:hover": {
         backgroundColor: (theme) => theme.brand.white[200],
      },
   },
   linkedinBtn: {
      backgroundColor: "#0077B5",
      color: "white",
      "&:hover": {
         backgroundColor: "#005885",
      },
   },
})

export type ShareLivestreamDialogProps = {
   handleClose: () => void
   livestreamId: string
}

export const ShareLivestreamDialog = ({
   handleClose,
   livestreamId,
}: ShareLivestreamDialogProps) => {
   const { userData } = useAuth()
   const { enqueueSnackbar } = useSnackbar()
   const [_, copyToClipboard] = useCopyToClipboard()

   const livestreamLink = useMemo(() => {
      return makeLivestreamEventDetailsInviteUrl(
         livestreamId,
         userData?.referralCode
      )
   }, [livestreamId, userData?.referralCode])

   const handleCopyClick = useCallback(() => {
      copyToClipboard(livestreamLink)
      enqueueSnackbar("Link copied to clipboard!", {
         variant: "success",
      })
      dataLayerEvent("livestream_share", {
         medium: "Copy Link",
         livestreamId,
      })
   }, [copyToClipboard, enqueueSnackbar, livestreamId, livestreamLink])

   const handleLinkedInClick = useCallback(() => {
      const encodedUrl = encodeURIComponent(livestreamLink)
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      window.open(linkedInUrl, "_blank")
      
      dataLayerEvent("livestream_share", {
         medium: "LinkedIn",
         livestreamId,
      })
   }, [livestreamId, livestreamLink])

   return (
      <SteppedDialog.Container
         containerSx={styles.content}
         sx={styles.wrapContainer}
         hideCloseButton
      >
         <SteppedDialog.Content sx={styles.container}>
            <Stack spacing={3} sx={styles.info}>
               <SteppedDialog.Title sx={styles.title}>
                  Share it with your audience!
               </SteppedDialog.Title>

               <SteppedDialog.Subtitle sx={styles.subtitle}>
                  Use this link to share your stream with your talent community!
               </SteppedDialog.Subtitle>

               <BrandedTextField
                  label="Live stream link"
                  value={livestreamLink}
                  InputProps={{
                     readOnly: true,
                     sx: {
                        fontSize: "14px",
                        color: "neutral.600",
                     },
                  }}
                  sx={styles.linkField}
               />

               <Box sx={styles.actions}>
                  <Button
                     variant="outlined"
                     onClick={handleCopyClick}
                     startIcon={<Copy size={16} />}
                     sx={[styles.actionBtn, styles.copyBtn]}
                  >
                     Copy
                  </Button>

                  <Button
                     variant="contained"
                     onClick={handleLinkedInClick}
                     startIcon={<Linkedin size={16} />}
                     sx={[styles.actionBtn, styles.linkedinBtn]}
                  >
                     LinkedIn
                  </Button>
               </Box>
            </Stack>
         </SteppedDialog.Content>
      </SteppedDialog.Container>
   )
}
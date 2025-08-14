import {
   Box,
   Button,
   Divider,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { SlideUpTransition } from "components/views/common/transitions"
import { livestreamService } from "data/firebase/LivestreamService"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Copy, ExternalLink, X } from "react-feather"
import { useCopyToClipboard } from "react-use"
import { sxStyles } from "types/commonTypes"
import { makeLivestreamUrl } from "util/makeUrls"

type EnterStreamDialogProps = {
   open: boolean
   onClose: () => void
   livestreamId: string
}

const styles = sxStyles({
   container: (theme) => ({
      padding: theme.spacing(1.5, 1.5, 3),
      display: "flex",
      flexDirection: "column",
   }),
   imageContainer: {
      width: "100%",
      aspectRatio: { xs: "351 / 177", md: "auto" },
      height: { md: 177 },
      position: "relative",
      borderRadius: { xs: "8px", md: "18.5px" },
      overflow: "hidden",
      mb: 3,
   },
   image: {
      objectFit: "cover",
      objectPosition: "center",
   },
   content: {
      mx: "auto",
      width: { xs: "100%", md: 477 },
   },
   divider: {
      width: "100%",
      color: "neutral.50",
   },
   input: {
      "& .MuiInputBase-input": {
         overflow: "hidden",
         textOverflow: "ellipsis",
      },
   },
   copyIcon: {
      cursor: "pointer",
      color: "neutral.500",
      ml: 1,
      "& svg": { width: 18, height: 18 },
   },
   copiedInput: (theme) => ({
      borderColor: `${theme.palette.success[700]} !important`,
      backgroundColor: (t) => t.brand.white[100],
   }),
   copiedLabel: (theme) => ({
      "& span": { color: `${theme.palette.success[700]} !important` },
   }),
   closeIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      color: "white",
      "& svg": { width: 24, height: 24 },
      p: 0.5,
      m: 0.3,
   },
})

type ContentProps = {
   livestreamId: string
   onClose: () => void
}

const Content = ({ livestreamId, onClose }: ContentProps) => {
   const [secureToken, setSecureToken] = useState<string | null>(null)
   const [copyState, copyToClipboard] = useCopyToClipboard()

   useEffect(() => {
      if (!livestreamId) return
      livestreamService
         .getLivestreamSecureToken(livestreamId)
         .then(setSecureToken)
         .catch(() => setSecureToken(null))
   }, [livestreamId])

   const hostLink = useMemo(
      () =>
         livestreamId
            ? makeLivestreamUrl(livestreamId, {
                 type: "host",
                 token: secureToken,
              })
            : "",
      [livestreamId, secureToken]
   )

   const hasCopied = copyState?.value === hostLink

   return (
      <ResponsiveDialogLayout.Content sx={styles.container}>
         <Box sx={styles.imageContainer}>
            <Image
               src="/illustrations/enter-stream.png"
               alt="Enter stream dialog background"
               fill
               quality={100}
               style={styles.image}
               sizes="100vw"
            />
            <IconButton onClick={onClose} sx={styles.closeIcon}>
               <X />
            </IconButton>
         </Box>
         <Stack sx={styles.content}>
            <Stack textAlign="center" mb={2}>
               <Typography
                  variant="brandedH5"
                  color="neutral.800"
                  fontWeight={700}
               >
                  Join your live stream!
               </Typography>
               <Typography variant="medium" color="neutral.700">
                  Use this link to join the stream or send it to your
                  co-speakers.
               </Typography>
            </Stack>

            <Stack spacing={2.5}>
               <BrandedTextField
                  label={hasCopied ? "Link copied!" : "Streamer link"}
                  value={hostLink}
                  InputProps={{
                     endAdornment: (
                        <Box
                           component={Copy}
                           sx={styles.copyIcon}
                           onClick={() => hostLink && copyToClipboard(hostLink)}
                        />
                     ),
                     readOnly: true,
                     sx: [styles.input, hasCopied && styles.copiedInput],
                  }}
                  InputLabelProps={{ sx: hasCopied ? styles.copiedLabel : {} }}
               />

               <Divider sx={styles.divider} />

               <Stack spacing={1.5} width="100%">
                  <Button
                     variant="outlined"
                     color="grey"
                     size="large"
                     fullWidth
                     onClick={() => hostLink && copyToClipboard(hostLink)}
                     startIcon={<Copy />}
                  >
                     Copy
                  </Button>
                  <Button
                     variant="contained"
                     color="secondary"
                     size="large"
                     fullWidth
                     onClick={() =>
                        hostLink && window.open(hostLink, "_blank")?.focus?.()
                     }
                     endIcon={<ExternalLink />}
                     data-testid="enter-stream-button"
                  >
                     Enter live stream room
                  </Button>
               </Stack>
            </Stack>
         </Stack>
      </ResponsiveDialogLayout.Content>
   )
}

export const EnterStreamDialog = ({
   open,
   onClose,
   livestreamId,
}: EnterStreamDialogProps) => {
   return (
      <ResponsiveDialogLayout
         open={open}
         handleClose={onClose}
         dataTestId="enter-stream-dialog"
         hideDragHandle
         dialogPaperStyles={{
            maxWidth: 517,
         }}
         TransitionComponent={SlideUpTransition}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         <Content livestreamId={livestreamId} onClose={onClose} />
      </ResponsiveDialogLayout>
   )
}

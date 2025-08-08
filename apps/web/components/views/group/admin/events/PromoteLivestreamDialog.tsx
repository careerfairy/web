import { LivestreamEventPublicData } from "@careerfairy/shared-lib/livestreams"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import {
   Box,
   Button,
   Divider,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { generateAndDownloadQr } from "components/util/image"
import { LinkedInIconFilled } from "components/views/common/icons/LinkedInIconFilled"
import { QRIcon } from "components/views/common/icons/QRIcon"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import { ResponsiveDialogLayout } from "components/views/common/ResponsiveDialog"
import { SlideUpTransition } from "components/views/common/transitions"
import Image from "next/image"
import { useMemo } from "react"
import { Copy, X } from "react-feather"
import { useCopyToClipboard } from "react-use"
import { sxStyles } from "types/commonTypes"
import { makeLivestreamEventDetailsShareUrl } from "util/makeUrls"

const styles = sxStyles({
   container: (theme) => ({
      padding: theme.spacing(1.5, 1.5, 3),
      display: "flex",
      flexDirection: "column",
   }),
   imageContainer: {
      width: "100%",
      // Use responsive sizing: aspect ratio on mobile, fixed height from md+
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
   divider: {
      width: "100%",
      color: "neutral.50",
   },
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

type Props = {
   companyName: string
   companyCountryCode?: string
   open: boolean
   onClose: () => void
   livestream: LivestreamEventPublicData
}

type ContentProps = {
   companyName: string
   companyCountryCode?: string
   livestream: LivestreamEventPublicData
   onClose: () => void
}

const Content = ({
   companyName,
   companyCountryCode,
   livestream,
   onClose,
}: ContentProps) => {
   const [copyState, copyToClipboard] = useCopyToClipboard()
   const isMobile = useIsMobile()

   const viewerLink = useMemo(
      () =>
         livestream
            ? makeLivestreamEventDetailsShareUrl(livestream.id, {
                 utm_source: "client",
                 utm_campaign: "events",
                 utm_content: (
                    companyNameSlugify(companyName) +
                    (companyCountryCode ? `-${companyCountryCode}` : "")
                 ).toLowerCase(),
              }).toString()
            : "",
      [livestream, companyName, companyCountryCode]
   )

   const hasCopied = copyState?.value === viewerLink

   const handleCopy = () => {
      if (viewerLink) copyToClipboard(viewerLink)
   }

   const handleLinkedIn = () => {
      if (!viewerLink) return
      const message =
         `Want to know more about ${companyName} and get the unique opportunity to start your career in [industry]?\n\n` +
         `Then mark the date: ${livestream.start
            .toDate()
            .toLocaleDateString()}.\n\n` +
         `We are going live on #CareerFairy and we will introduce you to the world of [live stream topic].\n\n` +
         `Join us to learn more about:\n` +
         `- [add reasons why students should join the live stream]\n\n` +
         `Register now: ${viewerLink}`
      const share = `https://www.linkedin.com/feed/?shareActive&mini=true&text=${encodeURIComponent(
         message
      )}`
      window.open(share, "_blank")?.focus?.()
   }

   const handleQrCode = async () => {
      if (!viewerLink) return
      await generateAndDownloadQr({
         value: viewerLink,
         size: 512,
         backgroundColor: null,
         fileName: `livestream-qr-${livestream.id}.png`,
      })
   }

   return (
      <ResponsiveDialogLayout.Content sx={styles.container}>
         <Box sx={styles.imageContainer}>
            <Image
               src={
                  isMobile
                     ? "/illustrations/share-audience-mobile.png"
                     : "/illustrations/share-audience.png"
               }
               alt="Livestream promo dialog background"
               fill
               quality={100}
               style={styles.image}
               sizes={
                  isMobile
                     ? "(max-width: 600px) 100vw"
                     : "(min-width: 601px) 100vw"
               }
            />
            {isMobile ? null : (
               <IconButton onClick={onClose} sx={styles.closeIcon}>
                  <X />
               </IconButton>
            )}
         </Box>
         <Stack sx={styles.content}>
            <Stack textAlign="center" mb={2}>
               <Typography
                  fontWeight={700}
                  variant="brandedH5"
                  color="neutral.800"
               >
                  Share it with your audience!
               </Typography>
               <Typography variant="medium" color="neutral.700">
                  Use this link to share your stream with your talent community!
               </Typography>
            </Stack>
            <Stack spacing={2.4375}>
               <BrandedTextField
                  label={hasCopied ? "Link copied!" : "Live stream link"}
                  value={viewerLink}
                  InputProps={{
                     endAdornment: (
                        <Box
                           component={Copy}
                           sx={styles.copyIcon}
                           onClick={handleCopy}
                        />
                     ),
                     readOnly: true,
                     sx: [styles.input, hasCopied && styles.copiedInput],
                  }}
                  InputLabelProps={{
                     sx: hasCopied ? styles.copiedLabel : {},
                  }}
               />

               <Divider sx={styles.divider} />

               <Stack
                  direction={{ xs: "column", md: "row" }}
                  gap={1.5}
                  width="100%"
               >
                  <Button
                     variant="outlined"
                     color="grey"
                     size="large"
                     fullWidth
                     onClick={handleCopy}
                     startIcon={<Copy />}
                  >
                     Copy
                  </Button>
                  <Button
                     variant="outlined"
                     color="grey"
                     size="large"
                     fullWidth
                     onClick={handleLinkedIn}
                     startIcon={<LinkedInIconFilled />}
                  >
                     LinkedIn
                  </Button>
                  <Button
                     variant="outlined"
                     color="grey"
                     size="large"
                     fullWidth
                     onClick={handleQrCode}
                     startIcon={<QRIcon />}
                  >
                     QR code
                  </Button>
               </Stack>
            </Stack>
         </Stack>
      </ResponsiveDialogLayout.Content>
   )
}

export const PromoteLivestreamDialog = ({
   companyName,
   companyCountryCode,
   open,
   onClose,
   livestream,
}: Props) => {
   return (
      <ResponsiveDialogLayout
         open={open}
         handleClose={onClose}
         dataTestId="promote-livestream-dialog"
         hideDragHandle
         dialogPaperStyles={{
            maxWidth: 517,
         }}
         TransitionComponent={SlideUpTransition}
         TransitionProps={{
            unmountOnExit: true,
         }}
      >
         <Content
            companyName={companyName}
            companyCountryCode={companyCountryCode}
            livestream={livestream}
            onClose={onClose}
         />
      </ResponsiveDialogLayout>
   )
}

import {
   Box,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   IconButton,
   Typography,
   useMediaQuery,
} from "@mui/material"

import React, { FC, useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { copyStringToClipboard } from "components/helperFunctions/HelperFunctions"
import ReferralWidget from "components/views/common/ReferralWidget"
import useSocials, {
   SocialPlatformObject,
} from "components/custom-hook/useSocials"
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined"
import {
   Copy as CopyIcon,
   CheckCircle as CheckIcon,
   X as CloseIcon,
} from "react-feather"
import { useTheme } from "@mui/styles"

const styles = sxStyles({
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
   },
   title: {
      display: "flex",
      alignItems: "center",
      fontSize: "16px",
   },
   shareIcon: {
      display: "flex",
      alignItems: "center",
      transform: "scaleX(-1)",
      mr: "9px",
      "& .MuiSvgIcon-root": {
         fontSize: "30px",
      },
   },
   dialogContent: {
      borderTop: "none",
   },
   dialogActions: {
      p: 0,
   },
   copyContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      py: "32px",
      "&.MuiBox-root": {
         "&:hover": {
            backgroundColor: "grey.main",
            cursor: "pointer",
         },
      },
   },
   copyText: {
      ml: "10px",
      fontSize: "18px",
   },
   copiedText: {
      color: "success.main",
   },
   dialog: {
      left: {
         xs: "0%",
         md: "10%",
      },
   },
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   shareUrl: string
}

const datalayerEntityName = "sparks"
const SparksShareDialog: FC<Props> = ({ isOpen, handleClose, shareUrl }) => {
   const [isCopied, setIsCopied] = useState(false)
   const theme = useTheme()
   const { breakpoints } = useTheme()
   const isSmallDisplay = useMediaQuery(breakpoints.down("md"))

   const handleCloseDialog = useCallback(() => {
      handleClose()
      setIsCopied(false)
   }, [handleClose])

   const socials = useSocials({
      title: "Sparks",
      url: shareUrl,
      dataLayerEntityName: datalayerEntityName,
      message: `Check out this Spark on CareerFairy!`,
      platforms: [
         SocialPlatformObject.Whatsapp,
         SocialPlatformObject.Linkedin,
         SocialPlatformObject.Facebook,
         SocialPlatformObject.X,
      ],
   })

   const copySparkLinkToClipboard = useCallback(() => {
      setIsCopied(true)
      const sourceLink = shareUrl + "&UTM_source=CareerFairy"
      copyStringToClipboard(sourceLink)
   }, [shareUrl])

   return (
      <Dialog
         maxWidth="sm"
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={isOpen}
         onClose={handleCloseDialog}
         PaperProps={{
            style: {
               left: isSmallDisplay ? "0%" : "10%",
            },
         }}
      >
         <DialogTitle>
            <Box sx={styles.titleContainer}>
               <Typography sx={styles.title}>
                  <Box sx={styles.shareIcon}>
                     <ReplyOutlinedIcon />
                  </Box>
                  Share
               </Typography>
               <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent dividers sx={styles.dialogContent}>
            <ReferralWidget socials={socials} noBackgroundColor isImageIcon />
         </DialogContent>
         <DialogActions sx={styles.dialogActions}>
            <Box sx={styles.copyContainer} onClick={copySparkLinkToClipboard}>
               {isCopied ? (
                  <>
                     <CheckIcon color={theme.palette.success.main} />
                     <Typography sx={[styles.copyText, styles.copiedText]}>
                        Link copied
                     </Typography>
                  </>
               ) : (
                  <>
                     <CopyIcon />
                     <Typography sx={styles.copyText}>
                        Copy Spark link
                     </Typography>
                  </>
               )}
            </Box>
         </DialogActions>
      </Dialog>
   )
}

export default SparksShareDialog

import {
   Box,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   IconButton,
   Typography,
} from "@mui/material"

import React, { FC, useCallback, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { copyStringToClipboard } from "components/helperFunctions/HelperFunctions"
import ReferralWidget from "components/views/common/ReferralWidget"
import useSocials, {
   SocialPlatformObject,
} from "components/custom-hook/useSocials"
import ShareArrowIcon from "components/views/common/icons/ShareArrowIcon"
import {
   Copy as CopyIcon,
   CheckCircle as CheckIcon,
   X as CloseIcon,
} from "react-feather"
import { useTheme } from "@mui/styles"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"
import { DRAWER_WIDTH } from "constants/layout"

const styles = sxStyles({
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
   },
   title: {
      display: "flex",
      alignItems: "center",
      fontSize: "1.14286rem",
   },
   shareIcon: {
      display: "flex",
      alignItems: "center",
      mr: "9px",
      fontSize: "30px",
      color: "white",
   },
   dialogContent: {
      borderTop: "none",
      display: "grid",
      placeItems: "center",
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
         transition: (theme) => theme.transitions.create("background-color"),
         "&:hover": {
            backgroundColor: "grey.main",
            cursor: "pointer",
         },
      },
   },
   copyText: {
      ml: "10px",
      color: "#505050",
      fontSize: "1.28571rem",
      letterSpacing: "-0.01414rem",
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
   dialogPaper: {
      maxWidth: 508,
   },
})

type Props = {
   isOpen: boolean
   handleClose: () => void
   shareUrl: string
   onShareOptionClick: () => void
}

const datalayerEntityName = "sparks"
const SparksShareDialog: FC<Props> = ({
   isOpen,
   handleClose,
   shareUrl,
   onShareOptionClick,
}) => {
   const [isCopied, setIsCopied] = useState(false)
   const theme = useTheme()
   const isFullScreen = useSparksFeedIsFullScreen()

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
      onShareOptionClick()
      setIsCopied(true)
      const sourceLink = shareUrl + "&utm_source=CareerFairy"
      copyStringToClipboard(sourceLink)
   }, [onShareOptionClick, shareUrl])

   return (
      <Dialog
         maxWidth={false}
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={isOpen}
         onClose={handleCloseDialog}
         PaperProps={{
            style: {
               left: isFullScreen ? "0%" : DRAWER_WIDTH - 120,
            },
            sx: styles.dialogPaper,
         }}
      >
         <DialogTitle>
            <Box sx={styles.titleContainer}>
               <Typography sx={styles.title}>
                  <ShareArrowIcon sx={styles.shareIcon} />
                  Share
               </Typography>
               <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent dividers sx={styles.dialogContent}>
            <ReferralWidget
               onSocialClick={onShareOptionClick}
               socials={socials}
               noBackgroundColor
               roundedIcons
            />
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

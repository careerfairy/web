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

import { useTheme } from "@mui/styles"
import useSocials, {
   SocialPlatformObject,
   SocialPlatformType,
} from "components/custom-hook/useSocials"
import { copyStringToClipboard } from "components/helperFunctions/HelperFunctions"
import ReferralWidget from "components/views/common/ReferralWidget"
import ShareArrowIcon from "components/views/common/icons/ShareArrowIcon"
import { FC, useCallback, useMemo, useState } from "react"
import {
   CheckCircle as CheckIcon,
   X as CloseIcon,
   Copy as CopyIcon,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerEvent } from "util/analyticsUtils"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { Group } from "@careerfairy/shared-lib/groups"

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
   dialogPaper: {
      maxWidth: 508,
   },
})

type Props = {
   group: Group
   handleClose: () => void
   isGroupAdmin?: boolean
}

const datalayerEntityName = "company_page"

const ShareCompanyPageDialog: FC<Props> = ({
   group,
   handleClose,
   isGroupAdmin,
}) => {
   const [isCopied, setIsCopied] = useState(false)
   const theme = useTheme()

   const handleCloseDialog = useCallback(() => {
      handleClose()
      setIsCopied(false)
   }, [handleClose])

   const companyPageUrl = useMemo(() => {
      return makeGroupCompanyPageUrl(group.universityName, {
         absoluteUrl: true,
      })
   }, [group.universityName])

   const socials = useSocials({
      title: group.universityName,
      url: companyPageUrl,
      dataLayerEntityName: datalayerEntityName,
      message: `Check out ${group.universityName}'s company page on CareerFairy!`,
      platforms: [
         SocialPlatformObject.Whatsapp,
         SocialPlatformObject.Linkedin,
         SocialPlatformObject.Facebook,
         SocialPlatformObject.X,
      ],
   })

   const handleShareOptionClick = useCallback((type: SocialPlatformType) => {
      // Track the share action
      dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
         medium: type,
      })
   }, [])

   const copyCompanyPageLinkToClipboard = useCallback(() => {
      handleShareOptionClick(SocialPlatformObject.Copy)
      setIsCopied(true)
      const sourceLink = companyPageUrl + "?utm_source=careerfairy"
      copyStringToClipboard(sourceLink)
   }, [handleShareOptionClick, companyPageUrl])

   return (
      <Dialog
         maxWidth={false}
         scroll="paper"
         fullWidth
         TransitionComponent={Grow}
         open={true}
         onClose={handleCloseDialog}
         PaperProps={{
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
               onSocialClick={handleShareOptionClick}
               socials={socials}
               noBackgroundColor
               roundedIcons
            />
         </DialogContent>
         <DialogActions sx={styles.dialogActions}>
            <Box sx={styles.copyContainer} onClick={copyCompanyPageLinkToClipboard}>
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
                        Copy company page link
                     </Typography>
                  </>
               )}
            </Box>
         </DialogActions>
      </Dialog>
   )
}

export default ShareCompanyPageDialog

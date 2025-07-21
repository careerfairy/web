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
import WhatsAppRoundedIcon from "components/views/common/icons/WhatsAppRoundedIcon"
import LinkedInRoundedIcon from "components/views/common/icons/LinkedInRoundedIcon"
import FacebookRoundedIcon from "components/views/common/icons/FacebookRoundedIcon"
import XRoundedIcon from "components/views/common/icons/XRoundedIcon"
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
import { facebookAppId } from "constants/links"

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
   onShareOptionClick?: (type: SocialPlatformType) => void
}

const datalayerEntityName = "company_page"

const ShareCompanyPageDialog: FC<Props> = ({
   group,
   handleClose,
   isGroupAdmin,
   onShareOptionClick,
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

   const socials = useMemo(() => {
      const buildUrlWithUtm = (medium: string) => {
         const utmParams = new URLSearchParams({
            utm_source: 'careerfairy',
            utm_medium: medium,
            utm_campaign: 'company-page',
            utm_content: group.universityName
         })
         return `${companyPageUrl}?${utmParams.toString()}`
      }

      const message = `Check out ${group.universityName}'s company page on CareerFairy!`
      const encodedMessage = encodeURIComponent(message)

      return [
         {
            icon: null,
            roundedIcon: WhatsAppRoundedIcon,
            name: "WhatsApp",
            onClick: () => {
               const whatsappUrl = buildUrlWithUtm('whatsapp')
               const encodedUrl = encodeURIComponent(whatsappUrl)
               window.open(`https://api.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`, "_blank")?.focus()
            },
            type: SocialPlatformObject.Whatsapp,
         },
         {
            icon: null,
            roundedIcon: LinkedInRoundedIcon,
            name: "LinkedIn",
            onClick: () => {
               const linkedinUrl = buildUrlWithUtm('linkedin')
               const encodedUrl = encodeURIComponent(linkedinUrl)
               window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")?.focus()
            },
            type: SocialPlatformObject.Linkedin,
         },
         {
            icon: null,
            roundedIcon: FacebookRoundedIcon,
            name: "Facebook",
            onClick: () => {
               const facebookUrl = buildUrlWithUtm('facebook')
               const encodedUrl = encodeURIComponent(facebookUrl)
               window.open(`https://www.facebook.com/dialog/share?app_id=${facebookAppId}&display=page&href=${encodedUrl}`, "_blank")?.focus()
            },
            type: SocialPlatformObject.Facebook,
         },
         {
            icon: null,
            roundedIcon: XRoundedIcon,
            name: "X",
            onClick: () => {
               const xUrl = buildUrlWithUtm('x')
               const encodedUrl = encodeURIComponent(xUrl)
               window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&via=CareerFairy&related=CareerFairy&text=${encodedMessage}`, "_blank")?.focus()
            },
            type: SocialPlatformObject.X,
         },
      ]
   }, [companyPageUrl, group.universityName])

   const handleShareOptionClick = useCallback((type: SocialPlatformType) => {
      // Map social platform types to UTM medium values for consistent tracking
      const mediumMapping = {
         [SocialPlatformObject.Whatsapp]: 'whatsapp',
         [SocialPlatformObject.Linkedin]: 'linkedin', 
         [SocialPlatformObject.Facebook]: 'facebook',
         [SocialPlatformObject.X]: 'x',
         [SocialPlatformObject.Copy]: 'copy',
      }
      
      const medium = mediumMapping[type] || type
      
      // Track the share action
      dataLayerEvent(AnalyticsEvents.CompanyPageShare, {
         medium: medium,
      })
      
      // Call parent callback if provided
      if (onShareOptionClick) {
         onShareOptionClick(type)
      }
   }, [onShareOptionClick])

   const copyCompanyPageLinkToClipboard = useCallback(() => {
      handleShareOptionClick(SocialPlatformObject.Copy)
      setIsCopied(true)
      
      // Build URL with new UTM structure
      const utmParams = new URLSearchParams({
         utm_source: 'careerfairy',
         utm_medium: 'copy',
         utm_campaign: 'company-page',
         utm_content: group.universityName
      })
      const sourceLink = `${companyPageUrl}?${utmParams.toString()}`
      
      copyStringToClipboard(sourceLink)
   }, [handleShareOptionClick, companyPageUrl, group.universityName])

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
                        Copy company link
                     </Typography>
                  </>
               )}
            </Box>
         </DialogActions>
      </Dialog>
   )
}

export default ShareCompanyPageDialog

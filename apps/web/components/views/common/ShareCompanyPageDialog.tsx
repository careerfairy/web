import {
   Box,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"

import { Group } from "@careerfairy/shared-lib/groups"
import { useTheme } from "@mui/material/styles"
import useCompanyPageSocials from "components/custom-hook/useCompanyPageSocials"
import { SocialPlatformType } from "components/custom-hook/useSocials"
import ReferralWidget from "components/views/common/ReferralWidget"
import ShareArrowIcon from "components/views/common/icons/ShareArrowIcon"
import {
   CheckCircle as CheckIcon,
   X as CloseIcon,
   Copy as CopyIcon,
} from "react-feather"
import { useCopyToClipboard } from "react-use"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   titleContainer: {
      display: "flex",
      justifyContent: "space-between",
   },
   title: {
      display: "flex",
      alignItems: "center",
   },
   shareIcon: {
      color: "transparent",
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
      color: "neutral.700",
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
   onShareOptionClick?: (type: SocialPlatformType) => void
}

export const ShareCompanyPageDialog = ({
   group,
   handleClose,
   onShareOptionClick,
}: Props) => {
   const [clipboardState, copyToClipboard] = useCopyToClipboard()
   const theme = useTheme()

   const { socials, handleCopy, resetClickedPlatforms } = useCompanyPageSocials(
      {
         group,
         onShareOptionClick,
      }
   )

   const handleCloseDialog = () => {
      handleClose()
      resetClickedPlatforms() // Reset analytics deduplication when dialog closes
   }

   const copyCompanyPageLinkToClipboard = () => {
      const sourceLink = handleCopy()
      copyToClipboard(sourceLink)
   }

   return (
      <Dialog
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
               <Stack direction="row" alignItems="center" spacing={1.125}>
                  <ShareArrowIcon sx={styles.shareIcon} />
                  <Typography
                     variant="medium"
                     fontWeight={400}
                     sx={styles.title}
                  >
                     Share
                  </Typography>
               </Stack>
               <IconButton onClick={handleCloseDialog}>
                  <CloseIcon />
               </IconButton>
            </Box>
         </DialogTitle>
         <DialogContent dividers sx={styles.dialogContent}>
            <ReferralWidget socials={socials} noBackgroundColor roundedIcons />
         </DialogContent>
         <DialogActions sx={styles.dialogActions}>
            <Box
               sx={styles.copyContainer}
               onClick={copyCompanyPageLinkToClipboard}
            >
               {clipboardState.value ? (
                  <>
                     <CheckIcon color={theme.palette.success.main} />
                     <Typography
                        variant="medium"
                        fontWeight={400}
                        sx={[styles.copyText, styles.copiedText]}
                     >
                        Link copied
                     </Typography>
                  </>
               ) : (
                  <>
                     <CopyIcon />
                     <Typography
                        variant="medium"
                        fontWeight={400}
                        sx={styles.copyText}
                     >
                        Copy company link
                     </Typography>
                  </>
               )}
            </Box>
         </DialogActions>
      </Dialog>
   )
}

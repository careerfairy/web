import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import CloseIcon from "@mui/icons-material/CloseRounded"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { Box, IconButton, Tooltip } from "@mui/material"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { FC, useCallback } from "react"
import { useCopyToClipboard } from "react-use"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import { makeLivestreamEventDetailsInviteUrl } from "../../../../../util/makeUrls"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import CircularLogo from "../../../../views/common/logos/CircularLogo"

const styles = sxStyles({
   topOverlay: {
      position: "absolute",
      top: 16,
      left: 16,
      right: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      zIndex: 10,
      pointerEvents: "none",
   },
   iconButton: {
      color: "neutral.800",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 1,
      padding: 1,
      pointerEvents: "auto",
      "&:hover": {
         backgroundColor: "rgba(255, 255, 255, 1)",
      },
      "& svg": {
         fontSize: "20px",
      },
   },
   bottomOverlay: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      display: "flex",
      alignItems: "flex-start",
      zIndex: 10,
      pointerEvents: "none",
   },
   companyInfo: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: 2,
      padding: 2,
      pointerEvents: "auto",
   },
   companyName: {
      fontSize: "14px",
      fontWeight: 400,
      fontFamily: "Poppins",
      color: "neutral.800",
   },
   livestreamTitle: {
      fontSize: "18px",
      fontWeight: 600,
      fontFamily: "Poppins",
      color: "neutral.800",
      marginTop: 1,
   },
})

type TopOverlayProps = {
   livestream: LivestreamEvent
   onClose: () => void
}

export const PastLivestreamTopOverlay: FC<TopOverlayProps> = ({
   livestream,
   onClose,
}) => {
   const { userData } = useAuth()
   const { successNotification } = useSnackbarNotifications()
   const [, copyEventLinkToClipboard] = useCopyToClipboard()

   const handleShare = useCallback(() => {
      const eventUrl = makeLivestreamEventDetailsInviteUrl(
         livestream.id,
         userData?.referralCode
      )

      copyEventLinkToClipboard(eventUrl)

      dataLayerLivestreamEvent("event_share", livestream, {
         medium: "Copy Link",
      })

      successNotification(
         "Live stream link has been copied to your clipboard",
         "Copied"
      )
   }, [copyEventLinkToClipboard, livestream, successNotification, userData])

   return (
      <Box sx={styles.topOverlay}>
         <Box /> {/* Spacer */}
         <Stack direction="row" spacing={1}>
            <Tooltip title="Share">
               <IconButton onClick={handleShare} sx={styles.iconButton}>
                  <ShareIcon />
               </IconButton>
            </Tooltip>
            <Tooltip title="Close">
               <IconButton onClick={onClose} sx={styles.iconButton}>
                  <CloseIcon />
               </IconButton>
            </Tooltip>
         </Stack>
      </Box>
   )
}

type BottomOverlayProps = {
   presenter: LivestreamPresenter
   livestreamTitle: string
}

export const PastLivestreamBottomOverlay: FC<BottomOverlayProps> = ({
   presenter,
   livestreamTitle,
}) => {
   return (
      <Box sx={styles.bottomOverlay}>
         <Box sx={styles.companyInfo}>
            <Stack spacing={1.5} direction="row" alignItems="center">
               <CircularLogo
                  src={presenter.companyLogoUrl}
                  alt={presenter.company}
                  size={28}
               />
               <Typography sx={styles.companyName}>
                  {presenter.company}
               </Typography>
            </Stack>
            <Typography sx={styles.livestreamTitle}>
               {livestreamTitle}
            </Typography>
         </Box>
      </Box>
   )
}

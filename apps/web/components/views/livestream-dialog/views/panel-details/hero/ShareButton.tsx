import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { IconButton, Tooltip } from "@mui/material"
import Box from "@mui/material/Box"
import { FC, useCallback } from "react"
import { useCopyToClipboard } from "react-use"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../../types/commonTypes"
import { dataLayerLivestreamEvent } from "../../../../../../util/analyticsUtils"
import { makeLivestreamEventDetailsInviteUrl } from "../../../../../../util/makeUrls"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"

const styles = sxStyles({
   root: {
      color: "white",
      "& svg": {
         fontSize: "24px",
      },
   },
   mobileButton: {
      backgroundColor: "rgba(52, 52, 52, 0.5)",
      color: "common.white",
      padding: "8px",
      borderRadius: "28px",
      "&:hover": {
         backgroundColor: "rgba(52, 52, 52, 0.7)",
      },
      "& svg": {
         fontSize: "20px",
      },
   },
   desktopButton: {
      backgroundColor: "transparent",
      color: "common.white",
      padding: 0,
      borderRadius: 0,
      "& svg": {
         fontSize: "24px",
      },
   },
})

type Props = {
   livestream: LivestreamEvent
}

const ShareButton: FC<Props> = ({ livestream }) => {
   const { userData } = useAuth()
   const { successNotification } = useSnackbarNotifications()
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [_, copyEventLinkToClipboard] = useCopyToClipboard()
   const isMobile = useIsMobile()

   const handleClick = useCallback(() => {
      const eventUrl = makeLivestreamEventDetailsInviteUrl(
         livestream.id,
         userData?.referralCode
      )

      copyEventLinkToClipboard(eventUrl)

      dataLayerLivestreamEvent("event_share", livestream, {
         medium: "Copy Link",
      })

      successNotification(
         "Master Class link has been copied to your clipboard",
         "Copied"
      )
   }, [
      copyEventLinkToClipboard,
      livestream,
      successNotification,
      userData?.referralCode,
   ])

   return (
      <Box sx={styles.root}>
         <Tooltip title="Share">
            <IconButton
               sx={isMobile ? styles.mobileButton : styles.desktopButton}
               onClick={handleClick}
            >
               <ShareIcon fontSize="inherit" />
            </IconButton>
         </Tooltip>
      </Box>
   )
}

export default ShareButton

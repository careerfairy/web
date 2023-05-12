import { FC, useCallback } from "react"
import { IconButton, Tooltip } from "@mui/material"
import ShareIcon from "@mui/icons-material/ShareOutlined"
import { useCopyToClipboard } from "react-use"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import { makeLivestreamEventDetailsInviteUrl } from "../../../../../util/makeUrls"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      top: 0,
      right: (theme) => ({ xs: 0, md: theme.spacing(4.5) }),
      color: "white",
      p: 1,
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
   const [_, copyEventLinkToClipboard] = useCopyToClipboard()

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
         "Live stream link has been copied to your clipboard",
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
            <IconButton color="info" onClick={handleClick}>
               <ShareIcon fontSize="inherit" />
            </IconButton>
         </Tooltip>
      </Box>
   )
}

export default ShareButton

import { FC, useCallback } from "react"
import { IconButton, Tooltip } from "@mui/material"
import CloseIcon from "@mui/icons-material/CloseRounded"
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
      p: 1,
      "& svg": {
         fontSize: "24px",
      },
   },
   whiteIcon: {
      color: "white",
   },
   neutralIcon: {
      color: "neutral.800",
   },
})

type Props = {
   livestream: LivestreamEvent
   isPastLivestream?: boolean
}

const ShareButton: FC<Props> = ({ livestream, isPastLivestream = false }) => {
   const { userData } = useAuth()
   const { successNotification } = useSnackbarNotifications()
   const [, copyEventLinkToClipboard] = useCopyToClipboard()

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
   }, [copyEventLinkToClipboard, livestream, successNotification, userData])

   return (
      <Box
         sx={[
            styles.root,
            isPastLivestream ? styles.neutralIcon : styles.whiteIcon,
         ]}
      >
         <Tooltip title="Share">
            <IconButton onClick={handleClick}>
               {isPastLivestream ? <ShareIcon /> : <CloseIcon />}
            </IconButton>
         </Tooltip>
      </Box>
   )
}

export default ShareButton

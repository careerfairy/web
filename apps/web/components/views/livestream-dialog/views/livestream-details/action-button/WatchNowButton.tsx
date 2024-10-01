import PlayIcon from "@mui/icons-material/PlayCircleOutlineRounded"
import { Button } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"
import { ActionButtonWrapper } from "./ActionButton"
import { useActionButtonContext } from "./ActionButtonProvider"
import styles from "./Styles"

const scrollToHero = () => {
   const element = document.getElementById("live-stream-dialog-hero")
   if (element) {
      element.scrollIntoView({
         behavior: "smooth",
         block: "start",
         inline: "end",
      })
   }
}
type WatchNowButtonProps = {
   fullWidth?: boolean
}
const WatchNowButton = ({ fullWidth }: WatchNowButtonProps) => {
   const { isLoggedIn } = useAuth()
   const {
      isFloating,
      heroVisible,
      isFixedToBottom,
      showIcon,
      secondary,
      outlined,
      onClickWatchRecording,
   } = useActionButtonContext()
   const { goToView } = useLiveStreamDialog()

   const handleWatchRecording = () => {
      if (onClickWatchRecording) {
         onClickWatchRecording()
      } else {
         goToView("livestream-details")
      }
   }

   const buttonText = isFixedToBottom ? "Watch recording" : "Watch now"

   return (
      <ActionButtonWrapper
         disableMarginTop
         isFloating={isFloating}
         isFixedToBottom={isFixedToBottom}
      >
         <Button
            id="watch-now-button"
            color={secondary ? "secondary" : "primary"}
            sx={[
               styles.btn,
               heroVisible && styles.hiddenButton,
               fullWidth && styles.btnFullWidth,
            ]}
            variant={outlined ? "outlined" : "contained"}
            fullWidth
            onClick={isFixedToBottom ? handleWatchRecording : scrollToHero}
            disableElevation
            endIcon={isFixedToBottom && !showIcon ? null : <PlayIcon />}
            data-testid="livestream-watch-now-button"
            size={isFixedToBottom ? "medium" : "large"}
         >
            {!isLoggedIn ? "Sign up to watch" : null}
            {isLoggedIn ? buttonText : null}
         </Button>
      </ActionButtonWrapper>
   )
}

export default WatchNowButton

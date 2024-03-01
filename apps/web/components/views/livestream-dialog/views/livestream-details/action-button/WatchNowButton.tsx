import React, { FC } from "react"
import { useActionButtonContext } from "./ActionButtonProvider"
import { Button } from "@mui/material"
import styles from "./Styles"
import PlayIcon from "@mui/icons-material/PlayCircleOutlineRounded"
import { ActionButtonWrapper } from "./ActionButton"
import { useLiveStreamDialog } from "components/views/livestream-dialog/LivestreamDialog"

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

const WatchNowButton: FC = () => {
   const { isFloating, heroVisible, isFixedToBottom } = useActionButtonContext()
   const { goToView } = useLiveStreamDialog()

   const handleWatchRecording = () => {
      goToView("livestream-details")
   }

   return (
      <ActionButtonWrapper disableMarginTop isFloating={isFloating} isFixedToBottom={isFixedToBottom}>
         <Button
            id="watch-now-button"
            color="primary"
            sx={[styles.btn, heroVisible && styles.hiddenButton]}
            variant={"contained"}
            fullWidth
            onClick={isFixedToBottom ? handleWatchRecording : scrollToHero}
            disableElevation
            endIcon={isFixedToBottom ? null : <PlayIcon />}
            data-testid="livestream-watch-now-button"
            size={isFixedToBottom ? "medium" : "large"}
         >
            {isFixedToBottom ? "Watch recording" : "Watch now"}
         </Button>
      </ActionButtonWrapper>
   )
}

export default WatchNowButton

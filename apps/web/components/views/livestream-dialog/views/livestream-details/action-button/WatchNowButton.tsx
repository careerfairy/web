import React, { FC } from "react"
import { useActionButtonContext } from "./ActionButtonProvider"
import { Button } from "@mui/material"
import styles from "./Styles"
import PlayIcon from "@mui/icons-material/PlayCircleOutlineRounded"
import { FloatingButtonWrapper } from "./ActionButton"

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
   const { isFloating, heroVisible } = useActionButtonContext()

   return (
      <FloatingButtonWrapper disableMarginTop isFloating={isFloating}>
         <Button
            id="watch-now-button"
            color="primary"
            sx={[styles.btn, heroVisible && styles.hiddenButton]}
            variant={"contained"}
            fullWidth
            onClick={scrollToHero}
            disableElevation
            endIcon={<PlayIcon />}
            data-testid="livestream-watch-now-button"
            size="large"
         >
            Watch now
         </Button>
      </FloatingButtonWrapper>
   )
}

export default WatchNowButton

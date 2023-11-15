import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { IconButton } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { isServer } from "components/helperFunctions/HelperFunctions"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      color: "white",
      "& svg": {
         width: 27.83,
         height: 27.83,
      },
   },
   dark: {
      color: "#3D3D47 !important",
   },
})

type Props = {
   dark?: boolean
}

const CloseSparksFeedButton: FC<Props> = ({ dark }) => {
   const { back, push } = useRouter()
   const { isLoggedIn, userPresenter } = useAuth()

   const handleClick = useCallback(() => {
      if (isServer()) return
      if (isLoggedIn && userPresenter.shouldSeeWelcomeDialog()) {
         push("/portal")
      } else if (window.history.length > 2) {
         back()
      } else {
         push("/portal")
      }
   }, [back, isLoggedIn, push, userPresenter])

   return (
      <IconButton
         sx={[styles.root, dark && styles.dark]}
         aria-label="close-sparks-feed"
         onClick={handleClick}
      >
         <CloseRoundedIcon color="inherit" />
      </IconButton>
   )
}

export default CloseSparksFeedButton

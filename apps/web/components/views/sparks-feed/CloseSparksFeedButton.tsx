import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { IconButton } from "@mui/material"
import { isServer } from "components/helperFunctions/HelperFunctions"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { sxStyles } from "types/commonTypes"
import { cameFromSignInOrSignUpPage as cameFromSignInOrSignUpPageSelector } from "../../../store/selectors/sparksFeedSelectors"
import { setCameFromSignInOrSignUpPage } from "../../../store/reducers/sparksFeedReducer"
import { useAuth } from "HOCs/AuthProvider"

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
   const dispatch = useDispatch()

   const { isLoggedIn } = useAuth()
   const cameFromSignInOrSignUpPage = useSelector(
      cameFromSignInOrSignUpPageSelector
   )

   const handleClick = useCallback(() => {
      if (isServer()) return
      debugger
      if (cameFromSignInOrSignUpPage && isLoggedIn) {
         push("/portal")
         dispatch(setCameFromSignInOrSignUpPage(false))
      } else if (window.history.length > 2) {
         back()
      } else {
         push("/portal")
      }
   }, [back, cameFromSignInOrSignUpPage, dispatch, isLoggedIn, push])

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

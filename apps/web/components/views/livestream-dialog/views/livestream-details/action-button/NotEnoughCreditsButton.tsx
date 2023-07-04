import React, { FC } from "react"
import { useActionButtonContext } from "./ActionButtonProvider"
import { useCreditsDialog } from "../../../../../../layouts/CreditsDialogLayout"
import { Button } from "@mui/material"
import styles from "./Styles"
import { FloatingButtonWrapper, LinkText } from "./ActionButton"

const NotEnoughCreditsButton: FC = () => {
   const { isFloating } = useActionButtonContext()

   const { handleOpenCreditsDialog } = useCreditsDialog()
   const handleClick = (e: React.SyntheticEvent) => {
      e.preventDefault()

      handleOpenCreditsDialog()
   }

   return (
      <FloatingButtonWrapper isFloating={isFloating}>
         <Button
            id="register-button"
            variant={"contained"}
            fullWidth
            color="navyBlue"
            sx={styles.btn}
            onClick={handleClick}
            disableElevation
            data-testid="livestream-not-enough-credits-button"
            size="large"
         >
            Not enough CareerCoins to unlock
         </Button>
         <LinkText isFloating={isFloating} onClick={handleClick}>
            Get more CareerCoins to access this recording
         </LinkText>
      </FloatingButtonWrapper>
   )
}

export default NotEnoughCreditsButton

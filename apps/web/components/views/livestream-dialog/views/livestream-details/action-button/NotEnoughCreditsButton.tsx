import React, { FC, useEffect } from "react"
import { useActionButtonContext } from "./ActionButtonProvider"
import { useCreditsDialog } from "../../../../../../layouts/CreditsDialogLayout"
import { Button } from "@mui/material"
import styles from "./Styles"
import { ActionButtonWrapper, LinkText } from "./ActionButton"

const NotEnoughCreditsButton: FC = () => {
   const { isFloating, isFixedToBottom, setIsDisabled } = useActionButtonContext()

   const { handleOpenCreditsDialog } = useCreditsDialog()
   const handleClick = (e: React.SyntheticEvent) => {
      e.preventDefault()

      handleOpenCreditsDialog()
   }

   useEffect(()=>{
      if (setIsDisabled){
         setIsDisabled(true)
      }
   }, [setIsDisabled])
   

   return (
      <ActionButtonWrapper isFloating={isFloating} isFixedToBottom={isFixedToBottom}>
         <Button
            id="register-button"
            variant={"contained"}
            fullWidth
            color={isFixedToBottom ? "secondary" : "navyBlue"}
            sx={isFixedToBottom ? null : styles.btn}
            onClick={handleClick}
            disableElevation
            data-testid="livestream-not-enough-credits-button"
            size={isFixedToBottom? "medium" : "large"}
            disabled={isFixedToBottom}
         >
            Not enough CareerCoins to unlock
         </Button>
         {!isFixedToBottom && 
            (<LinkText isFloating={isFloating} onClick={handleClick}>
               Get more CareerCoins to access this recording
            </LinkText>)
         }
      </ActionButtonWrapper>
   )
}

export default NotEnoughCreditsButton

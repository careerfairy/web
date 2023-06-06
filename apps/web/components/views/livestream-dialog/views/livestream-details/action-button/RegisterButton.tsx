import React, { FC, useCallback, useState } from "react"
import Box from "@mui/material/Box"
import { Button } from "@mui/material"
import styles from "./Styles"
import CheckIcon from "@mui/icons-material/Check"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { FloatingButtonWrapper, LinkText } from "./ActionButton"
import { useActionButtonContext } from "./ActionButtonProvider"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import StyledToolTip from "../../../../../../materialUI/GlobalTooltips/StyledToolTip"

type RegisterButtonProps = {
   label: string
   toolTip?: string
}
const RegisterButton: FC<RegisterButtonProps> = ({ label, toolTip }) => {
   const { authenticatedUser, isLoadingUserData, isLoadingAuth } = useAuth()
   const { onRegisterClick, livestreamPresenter, isFloating } =
      useActionButtonContext()

   // Must use controlled open state for Tooltip to work with disabled button
   const [open, setOpen] = useState(false)

   const registered = livestreamPresenter.isUserRegistered(
      authenticatedUser.email
   )

   const disabled = livestreamPresenter.isRegistrationDisabled(
      authenticatedUser.email
   )

   const isPast = livestreamPresenter.isPast()

   const buttonDisabled = disabled || registered

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      toolTip && setOpen(true)
   }

   const handleClick = useCallback(() => {
      if (isLoadingUserData || isLoadingAuth) {
         // only allow the user register action when the auth is fully loaded
         // otherwise, the user might be redirected to login
         // we could also make the button disabled, but the UI is already changing a
         // lot when opening the dialog, 99.5% of the times the auth should be loaded
         // when the user clicks the button.
         return
      }
      onRegisterClick(isFloating)
   }, [isLoadingUserData, isLoadingAuth, onRegisterClick, isFloating])

   return (
      <FloatingButtonWrapper isFloating={isFloating}>
         <Box
            onMouseEnter={() => buttonDisabled && handleOpen()}
            onMouseLeave={() => buttonDisabled && handleClose()}
            component="span"
            width="100%"
            maxWidth={572}
         >
            <Button
               id="register-button"
               color={"secondary"}
               variant={"contained"}
               sx={[styles.btn, registered && styles.successButton]}
               fullWidth
               startIcon={registered ? <CheckIcon /> : null}
               endIcon={
                  toolTip ? (
                     <StyledToolTip
                        arrow
                        open={open}
                        leaveDelay={1500}
                        onClose={handleClose}
                        onOpen={handleOpen}
                        title={toolTip || ""}
                        placement="top"
                     >
                        <InfoOutlinedIcon />
                     </StyledToolTip>
                  ) : null
               }
               disabled={buttonDisabled}
               onClick={handleClick}
               disableElevation
               data-testid="livestream-registration-button"
               size="large"
            >
               {label}
            </Button>
         </Box>
         {registered && !isPast ? (
            <LinkText isFloating={isFloating} onClick={handleClick}>
               Cancel registration
            </LinkText>
         ) : null}
      </FloatingButtonWrapper>
   )
}

export default RegisterButton

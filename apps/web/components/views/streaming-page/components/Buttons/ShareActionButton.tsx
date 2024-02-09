import { forwardRef } from "react"
import { Airplay } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import useMenuState from "components/custom-hook/useMenuState"
import { ShareMenu } from "../ShareMenu"

export const ShareActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const { anchorEl, handleClick, open, handleClose } = useMenuState()

   return (
      <span>
         <ActionBarButtonStyled
            active={open}
            ref={ref}
            {...props}
            onClick={handleClick}
         >
            <Airplay />
         </ActionBarButtonStyled>
         <ShareMenu open={open} anchorEl={anchorEl} handleClose={handleClose} />
      </span>
   )
})
ShareActionButton.displayName = "ShareActionButton"

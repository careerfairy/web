import { forwardRef } from "react"
import { Settings } from "react-feather"
import { ActionButtonProps, ActionBarButtonStyled } from "./ActionBarButton"
import { useAppDispatch } from "components/custom-hook/store"
import { toggleSettingsMenu } from "store/reducers/streamingAppReducer"

export const SettingsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const dispatch = useAppDispatch()

   return (
      <ActionBarButtonStyled
         onClick={() => dispatch(toggleSettingsMenu())}
         ref={ref}
         {...props}
      >
         <Settings />
      </ActionBarButtonStyled>
   )
})
SettingsActionButton.displayName = "SettingsActionButton"

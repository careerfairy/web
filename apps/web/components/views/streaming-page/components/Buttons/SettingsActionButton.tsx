import { useAppDispatch } from "components/custom-hook/store"
import { forwardRef } from "react"
import { Settings } from "react-feather"
import { toggleSettingsMenu } from "store/reducers/streamingAppReducer"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const SettingsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const dispatch = useAppDispatch()

   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.Settings : null}>
         <ActionBarButtonStyled
            onClick={() => dispatch(toggleSettingsMenu())}
            ref={ref}
            {...props}
         >
            <Settings />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})
SettingsActionButton.displayName = "SettingsActionButton"

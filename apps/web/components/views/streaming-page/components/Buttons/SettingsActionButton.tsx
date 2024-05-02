import { useAppDispatch } from "components/custom-hook/store"
import useIsMobile from "components/custom-hook/useIsMobile"
import { forwardRef } from "react"
import { Settings } from "react-feather"
import { toggleSettingsMenu } from "store/reducers/streamingAppReducer"
import { useStreamingContext } from "../../context"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const SettingsActionButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>((props, ref) => {
   const dispatch = useAppDispatch()
   const { shouldStream } = useStreamingContext()
   const isMobile = useIsMobile()

   const isSpeedDial = shouldStream && isMobile

   return (
      <BrandedTooltip
         title={"Settings"}
         placement={isSpeedDial ? "left" : "top"}
      >
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

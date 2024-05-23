import { Box, SxProps, buttonBaseClasses } from "@mui/material"
import SpeedDial, {
   SpeedDialProps,
   speedDialClasses,
} from "@mui/material/SpeedDial"
import SpeedDialAction, {
   SpeedDialActionProps,
} from "@mui/material/SpeedDialAction"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import { ReactNode, forwardRef } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"
import { tooltipStyles } from "../streaming-page/components/BrandedTooltip"

const styles = sxStyles({
   root: {
      position: "relative",
   },
   speedDial: (theme) => ({
      position: "absolute",
      bottom: 0,
      boxShadow: "none",
      [`& .${buttonBaseClasses.root}`]: {
         boxShadow: "none",
         width: 38,
         height: 38,
         [theme.breakpoints.up("tablet")]: {
            width: 44,
            height: 44,
         },
      },
      [`& .${speedDialClasses.actionsClosed}`]: {
         backgroundColor: "transparent",
      },
      [`& .${speedDialClasses.fab}`]: {
         backgroundColor: theme.brand.white[200],
         color: theme.palette.primary.main,
         "&:hover": {
            backgroundColor: theme.palette.action.hover,
         },
      },
      [`& .${speedDialClasses.actions}`]: {
         transition: theme.transitions.create("background-color"),
         pb: 0,
         mb: 1,
         borderRadius: 66,
         // ensures the hover effect is applied to the entire button
         "&:before": {
            content: "''",
            position: "absolute",
            inset: 0,
         },
      },
      zIndex: 0,
      width: {
         xs: 38,
         tablet: 44,
      },
   }),
   speedDialDisabled: {
      pointerEvents: "none",
   },
   speedDialOpen: (theme) => ({
      "& .MuiSpeedDial-fab": {
         backgroundColor: theme.palette.action.hover,
      },
      "& .MuiSpeedDial-actions": {
         backgroundColor: theme.brand.white[200],
      },
   }),
   responsive: {
      width: {
         xs: 38,
         tablet: 44,
      },
      height: {
         xs: 38,
         tablet: 44,
      },
   },
   speedDialAction: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   noShadow: {
      boxShadow: "none !important",
      filter: "none !important",
   },
})

export type BrandedSpeedDialAction = {
   node: ReactNode
   tooltip: string
   onClick?: SpeedDialActionProps["onClick"]
}

type Props = {
   actions: BrandedSpeedDialAction[]
   open: boolean
   speedDialIcon?: ReactNode
   speedDialOpenIcon?: ReactNode
   speedDialSx?: SxProps
   disabled?: boolean
} & Pick<SpeedDialProps, "open" | "onClick" | "onOpen" | "onClose">

export const BrandedSpeedDial = forwardRef<HTMLDivElement, Props>(
   (
      {
         actions,
         open,
         onClick,
         speedDialIcon,
         speedDialOpenIcon,
         onOpen,
         onClose,
         speedDialSx,
         disabled,
      },
      ref
   ) => {
      return (
         <Box sx={[styles.root, styles.responsive]}>
            <SpeedDial
               ref={ref}
               sx={combineStyles(speedDialSx, [
                  styles.speedDial,
                  open && styles.speedDialOpen,
                  disabled && styles.speedDialDisabled,
               ])}
               ariaLabel="Stream additional actions"
               color="secondary"
               icon={
                  <SpeedDialIcon
                     icon={speedDialIcon}
                     openIcon={speedDialOpenIcon}
                  />
               }
               onClick={onClick}
               open={open}
               onOpen={onOpen}
               onClose={onClose}
               FabProps={{
                  sx: styles.noShadow,
                  disabled,
                  disableRipple: disabled,
                  disableFocusRipple: disabled,
                  disableTouchRipple: disabled,
               }}
            >
               {actions.map((action) => {
                  return (
                     <SpeedDialAction
                        key={action.tooltip}
                        icon={action.node}
                        tooltipTitle={action.tooltip}
                        FabProps={{
                           sx: [styles.noShadow, styles.speedDialAction],
                           component: "div",
                        }}
                        onClick={(e) => action.onClick?.(e)}
                        slotProps={{
                           tooltip: { sx: tooltipStyles.tooltip },
                        }}
                     />
                  )
               })}
            </SpeedDial>
         </Box>
      )
   }
)

BrandedSpeedDial.displayName = "BrandedSpeedDial"

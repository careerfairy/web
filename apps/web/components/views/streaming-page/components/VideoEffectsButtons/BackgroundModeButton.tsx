import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   CircularProgress,
   TooltipProps,
   Typography,
} from "@mui/material"
import { ReactNode, forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { VirtualBackgroundMode } from "../../types"
import { BrandedTooltip } from "../BrandedTooltip"

const styles = sxStyles({
   buttonWrapper: {
      width: "100%",
   },
   root: (theme) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      py: 1.5,
      px: 1.75,
      width: "100%",
      height: "100%",
      bgcolor: theme.brand.white[300],
      border: `1px solid ${theme.brand.purple[100]}`,
      borderRadius: 2,
      "& svg": {
         color: "inherit",
         fontSize: 24,
         width: 24,
         height: 24,
      },
      transition: theme.transitions.create(["background-color", "color"]),
      position: "relative",
      color: theme.palette.neutral[400],
   }),
   active: {
      color: "white",
      bgcolor: "primary.500",
   },
   label: {
      mt: 1.25,
      fontSize: 12,

      color: "inherit",
   },
   loader: {
      display: "flex",
   },
   tooltip: {
      display: "inline",
   },
   tooltipPopper: {
      maxWidth: 219,
   },
   disabled: (theme) => ({
      "&:disabled": {
         opacity: 0.3,
         bgcolor: theme.brand.white[400],
         color: theme.brand.black[700],
      },
   }),
})

const customSlotProps: TooltipProps["slotProps"] = {
   popper: {
      modifiers: [
         {
            name: "offset",
            options: {
               offset: [0, -12], // move down 12px to match Figma Design
            },
         },
      ],
   },
}

type Props = {
   label: string
   icon: ReactNode
   active?: boolean
   loading?: boolean
   error?: Error | boolean
   mode: VirtualBackgroundMode
} & ButtonBaseProps

export const BackgroundModeButton = forwardRef<HTMLButtonElement, Props>(
   ({ label, icon, active, loading, error, disabled, mode, ...rest }, ref) => {
      const isActive = active && !loading

      const isDisabled = Boolean(disabled || error)
      return (
         <BrandedTooltip
            placement="top"
            PopperProps={{
               sx: styles.tooltipPopper,
            }}
            sx={styles.tooltip}
            title={getButtonTooltip(mode, error)}
            slotProps={customSlotProps}
         >
            <Box component="span" sx={styles.buttonWrapper}>
               <ButtonBase
                  {...rest}
                  sx={[
                     styles.root,
                     isActive && styles.active,
                     isDisabled && styles.disabled,
                  ]}
                  disabled={isDisabled}
                  ref={ref}
               >
                  {loading ? <Loader /> : icon}
                  <Typography sx={styles.label}>{label}</Typography>
               </ButtonBase>
            </Box>
         </BrandedTooltip>
      )
   }
)

BackgroundModeButton.displayName = "BackgroundModeButton"

const Loader = () => {
   return (
      <Box component="span" sx={styles.loader}>
         <CircularProgress color="inherit" size={23} />
      </Box>
   )
}

function getButtonTooltip(type: VirtualBackgroundMode, error: Error | boolean) {
   if (!error) {
      return ""
   }

   return `Your browser doesn't support the ${type} functionality. No effect has been applied`
}

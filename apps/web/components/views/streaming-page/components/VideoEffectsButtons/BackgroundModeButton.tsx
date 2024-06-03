import {
   Box,
   ButtonBase,
   ButtonBaseProps,
   CircularProgress,
   Typography,
} from "@mui/material"
import { ReactNode, forwardRef } from "react"
import { AlertCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { VirtualBackgroundMode } from "../../types"
import { BrandedTooltip } from "../BrandedTooltip"

const styles = sxStyles({
   buttonWrapper: {
      width: "inherit",
   },
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      py: 1.5,
      px: 1.75,
      width: "100%",
      height: "100%",
      bgcolor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.purple[100]}`,
      borderRadius: 2,
      color: "#0000008A",
      "& svg": {
         color: "inherit",
         fontSize: 24,
         width: 24,
         height: 24,
      },
      transition: (theme) =>
         theme.transitions.create(["background-color", "color"]),
      position: "relative",
   },
   active: {
      color: "white",
      bgcolor: "primary.500",
   },
   warningIconWrapper: {
      p: 1,
      position: "absolute",
      top: 0,
      right: 0,
      "& svg": {
         color: "warning.600",
         width: 20,
         height: 20,
      },
   },
   label: {
      mt: 1.25,
      fontSize: 12,
      color: (theme) => theme.palette.neutral[400],
   },
   labelActive: {
      color: "white",
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
})

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
         >
            <Box component="span" sx={styles.buttonWrapper}>
               <ButtonBase
                  {...rest}
                  sx={[styles.root, isActive && styles.active]}
                  disabled={isDisabled}
                  ref={ref}
               >
                  {Boolean(error) && (
                     <Box sx={styles.warningIconWrapper}>
                        <AlertCircle />
                     </Box>
                  )}
                  {loading ? <Loader /> : icon}
                  <Typography
                     sx={[styles.label, isActive && styles.labelActive]}
                  >
                     {label}
                  </Typography>
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

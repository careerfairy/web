import { Tooltip, tooltipClasses } from "@mui/material"
import { TooltipProps } from "@mui/material/Tooltip"
import { styled, Theme } from "@mui/material/styles"

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip arrow {...props} classes={{ popper: className }}>
      {props.children}
   </Tooltip>
))(({ theme }: { theme: Theme }) => ({
   [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "white",
      color: "rgba(0, 0, 0, 0.87)",
      fontSize: "0.92rem",
      px: theme.spacing(1),
      py: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      boxShadow: theme.legacy.boxShadows.dark_8_25_10,
   },
   [`& .${tooltipClasses.arrow}`]: {
      color: "white",
   },
}))

export default StyledToolTip

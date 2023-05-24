import { Tooltip, tooltipClasses } from "@mui/material"
import { TooltipProps } from "@mui/material/Tooltip"
import { styled } from "@mui/styles"

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip {...props} classes={{ popper: className }}>
      {props.children}
   </Tooltip>
))(({ theme }) => ({
   [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "white",
      color: "rgba(0, 0, 0, 0.87)",
      fontSize: "0.92rem",
      px: theme.spacing(1),
      py: theme.spacing(1.5),
      borderRadius: theme.spacing(1),
      boxShadow: theme.boxShadows.dark_8_25_10,
   },
   [`& .${tooltipClasses.arrow}`]: {
      color: "white",
   },
}))

export default StyledToolTip

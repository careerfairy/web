import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip"
import { styled } from "@mui/material/styles"

const BrandedTooltip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip
      enterTouchDelay={0}
      {...props}
      arrow
      classes={{ popper: className }}
   />
))(({ theme }) => ({
   [`& .${tooltipClasses.arrow}`]: {
      color:
         theme.palette.mode === "dark"
            ? theme.palette.common.black
            : theme.palette.common.white,
      "&:before": {
         border: "1px solid #BCBCBC",
         borderRadius: 1,
      },
   },
   [`& .${tooltipClasses.tooltip}`]: {
      padding: theme.spacing(1.5),
      backgroundColor:
         theme.palette.mode === "dark"
            ? theme.palette.common.black
            : theme.palette.common.white,
      color:
         theme.palette.mode === "dark"
            ? theme.palette.common.white
            : theme.palette.common.black,
      border: "1px solid #BCBCBC",
      borderRadius: 7,
      fontSize: "0.85714rem",
   },
}))

export default BrandedTooltip

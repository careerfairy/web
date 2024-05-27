import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material"
import { sxStyles } from "types/commonTypes"

export const tooltipStyles = sxStyles({
   tooltip: {
      textAlign: "center",
      color: (theme) => theme.palette.neutral["700"],
      fontSize: "12px",
      fontWeight: 400,
      py: 1,
   },
})

export const BrandedTooltip = styled(
   ({ className, placement = "top", ...props }: TooltipProps) => (
      <Tooltip
         {...props}
         componentsProps={{
            tooltip: {
               sx: tooltipStyles.tooltip,
            },
         }}
         placement={placement}
         classes={{ popper: className }}
      />
   )
)({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: "none",
   },
})

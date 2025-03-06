import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material"
import { CSSProperties } from "react"
import { sxStyles } from "types/commonTypes"

export const tooltipStyles = sxStyles({
   tooltip: {
      textAlign: "center",
      color: (theme) => theme.palette.neutral["700"],
      fontSize: "12px",
      fontWeight: 400,
      py: 1,
   },
   wrapper: {
      display: "flex",
   },
})

export const BrandedTooltip = styled(
   ({
      className,
      placement = "top",
      children,
      wrapperStyles,
      ...props
   }: TooltipProps & { wrapperStyles?: CSSProperties }) => (
      <Tooltip
         {...props}
         componentsProps={{
            tooltip: {
               sx: tooltipStyles.tooltip,
            },
         }}
         placement={placement}
         classes={{ popper: className }}
         id="tooltip-background-mode-button"
      >
         <span style={{ ...tooltipStyles.wrapper, ...wrapperStyles }}>
            {children}
         </span>
      </Tooltip>
   )
)({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: "none",
   },
})

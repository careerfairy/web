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
      offset,
      ...props
   }: TooltipProps & {
      wrapperStyles?: CSSProperties
      /**
       * Offset from the target element in pixels.
       * @param offset[0] - Horizontal offset (positive = right, negative = left)
       * @param offset[1] - Vertical offset (positive = down, negative = up)
       * @example [0, 5] - 5px gap below the element
       * @example [10, 0] - 10px gap to the right of the element
       * @example [-5, -10] - 5px gap to the left and 10px gap above the element
       */
      offset?: [number, number] | readonly [number, number]
   }) => (
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
         PopperProps={
            offset
               ? {
                    modifiers: [
                       {
                          name: "offset",
                          options: {
                             offset,
                          },
                       },
                    ],
                 }
               : undefined
         }
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

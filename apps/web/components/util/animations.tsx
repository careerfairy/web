import { Collapse, Grow, GrowProps } from "@mui/material"
import { forwardRef } from "react"

type Props = Pick<GrowProps, "in" | "appear" | "children" | "unmountOnExit">

export const CollapseAndGrow = forwardRef<HTMLDivElement, Props>(
   ({ children, unmountOnExit = true, ...props }, ref) => {
      return (
         <Grow ref={ref} unmountOnExit={unmountOnExit} {...props}>
            <Collapse unmountOnExit={unmountOnExit} {...props}>
               {children}
            </Collapse>
         </Grow>
      )
   }
)

CollapseAndGrow.displayName = "CollapseAndGrow"

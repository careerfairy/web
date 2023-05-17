import React from "react"
import { TransitionProps } from "@mui/material/transitions"
import { Slide } from "@mui/material"

export const SlideUpTransition = React.forwardRef(function SlideUpTransition(
   props: TransitionProps & {
      children: React.ReactElement<any, any>
   },
   ref: React.Ref<unknown>
) {
   return (
      <Slide direction="up" ref={ref} {...props}>
         {props.children}
      </Slide>
   )
})

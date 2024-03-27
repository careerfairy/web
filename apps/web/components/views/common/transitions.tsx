import React from "react"
import { TransitionProps } from "@mui/material/transitions"
import { Slide } from "@mui/material"

export const SlideUpTransition = React.forwardRef(function SlideUpTransition(
   props: TransitionProps & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export const SlideUpDownTransition = React.forwardRef(
   function SlideUpDownTransition(
      props: TransitionProps & {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         children: React.ReactElement<any, any>
      },
      ref: React.Ref<unknown>
   ) {
      const [direction, setDirection] = React.useState("up")

      const slideDirection = direction as "left" | "right" | "up" | "down"
      return (
         <Slide
            {...props}
            ref={ref}
            direction={slideDirection}
            onEntered={() => setDirection("up")}
            onExited={() => setDirection("down")}
         />
      )
   }
)

export const SlideLeftTransition = React.forwardRef(
   function SlideLeftTransition(
      props: TransitionProps & {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         children: React.ReactElement<any, any>
      },
      ref: React.Ref<unknown>
   ) {
      return (
         <Slide direction="left" ref={ref} {...props}>
            {props.children}
         </Slide>
      )
   }
)

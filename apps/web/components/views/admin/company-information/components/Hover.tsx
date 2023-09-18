import { Button, Fade, SxProps } from "@mui/material"
import { Component, FC, ReactElement, ReactNode, useState } from "react"

type PropsHover = {
   DefaultComponent: ReactElement
   HoverComponent: ReactElement
   sx?: SxProps
}

const Hover: FC<PropsHover> = ({ DefaultComponent, HoverComponent, sx }) => {
   const [hover, setHover] = useState(false)

   return (
      <Button
         sx={sx}
         onMouseOver={() => setHover(true)}
         onMouseOut={() => setHover(false)}
      >
         {hover ? <Fade in={hover}>{HoverComponent}</Fade> : null}
         {!hover ? <Fade in={!hover}>{DefaultComponent}</Fade> : null}
      </Button>
   )
}

export default Hover

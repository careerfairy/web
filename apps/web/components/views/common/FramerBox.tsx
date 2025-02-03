import Box, { BoxProps } from "@mui/material/Box"
import { motion } from "framer-motion"
import { ComponentProps, forwardRef } from "react"

const BoxComponent = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
   <Box {...props} ref={ref} />
))

BoxComponent.displayName = "BoxComponent"

const FramerBox = motion(BoxComponent)

export type FramerBoxProps = ComponentProps<typeof FramerBox>

export default FramerBox

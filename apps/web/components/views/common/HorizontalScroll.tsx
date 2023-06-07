import React, { useRef, useState, FC, useCallback, useMemo } from "react"
import { Box, SxProps } from "@mui/material"
import { sxStyles } from "../../../types/commonTypes"
import { BoxProps } from "@mui/material/Box"

const styles = sxStyles({
   root: {
      overflowX: "auto",
   },
})
type Props = BoxProps

/**
 * HorizontalScroll component provides a horizontally scrollable area
 * that can be scrolled by clicking and dragging with the mouse.
 *
 * @param {object} props The properties of the component.
 * @param {React.ReactNode} props.children The children to be rendered inside the scrollable area.
 * @param {SxProps} [props.sx] Additional styles to apply to the component.
 * @returns {ReactElement} The rendered component.
 */
const HorizontalScroll: FC<Props> = ({ children, sx, ...boxProps }) => {
   const [isDragging, setIsDragging] = useState(false)
   const [startX, setStartX] = useState(0)
   const [scrollLeft, setScrollLeft] = useState(0)

   const ref = useRef<HTMLDivElement>(null)

   const mouseDownHandler = useCallback((e: React.MouseEvent) => {
      setIsDragging(true)
      setStartX(e.pageX - ref.current!.offsetLeft)
      setScrollLeft(ref.current!.scrollLeft)
   }, [])

   const mouseLeaveHandler = useCallback(() => {
      setIsDragging(false)
   }, [])

   const mouseUpHandler = useCallback(() => {
      setIsDragging(false)
   }, [])

   const mouseMoveHandler = useCallback(
      (e: React.MouseEvent) => {
         if (!isDragging) return
         e.preventDefault()
         const x = e.pageX - ref.current!.offsetLeft
         const walk = x - startX
         ref.current!.scrollLeft = scrollLeft - walk
      },
      [isDragging, startX, scrollLeft]
   )

   const baseStyles = useMemo<BoxProps["sx"]>(
      () => [
         styles.root,
         {
            cursor: isDragging ? "grabbing" : "grab",
         },
         ...(Array.isArray(sx) ? sx : [sx]),
      ],
      [isDragging, sx]
   )

   return (
      <Box
         ref={ref}
         onMouseDown={mouseDownHandler}
         onMouseLeave={mouseLeaveHandler}
         onMouseUp={mouseUpHandler}
         onMouseMove={mouseMoveHandler}
         sx={baseStyles}
         {...boxProps}
      >
         {children}
      </Box>
   )
}

export default HorizontalScroll

import { Box, SxProps } from "@mui/material"
import { BoxProps } from "@mui/material/Box"
import React, { FC, useCallback, useMemo, useRef, useState } from "react"
import { combineStyles, sxStyles } from "../../../types/commonTypes"

const styles = sxStyles({
   root: {
      overflowX: "auto",
   },
   rootDragging: {
      "> *": {
         pointerEvents: "none",
      },
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
   const [shouldDrag, setShouldDrag] = useState(false)
   const [startX, setStartX] = useState(0)
   const [scrollLeft, setScrollLeft] = useState(0)

   const ref = useRef<HTMLDivElement>(null)

   const mouseDownHandler = useCallback((e: React.MouseEvent) => {
      setShouldDrag(true)
      setStartX(e.pageX - ref.current!.offsetLeft)
      setScrollLeft(ref.current!.scrollLeft)
   }, [])

   const mouseLeaveHandler = useCallback(() => {
      setIsDragging(false)
      setShouldDrag(false)
   }, [])

   const mouseUpHandler = useCallback(() => {
      setIsDragging(false)
      setShouldDrag(false)
   }, [])

   const mouseMoveHandler = useCallback(
      (e: React.MouseEvent) => {
         if (!shouldDrag) return
         setIsDragging(true)
         e.preventDefault()
         const x = e.pageX - ref.current!.offsetLeft
         const walk = x - startX
         ref.current!.scrollLeft = scrollLeft - walk
      },
      [shouldDrag, startX, scrollLeft]
   )

   const baseStyles = useMemo<BoxProps["sx"]>(
      () =>
         combineStyles(
            styles.root,
            {
               cursor: isDragging ? "grabbing" : "grab",
            },
            isDragging ? styles.rootDragging : null,
            sx
         ),
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

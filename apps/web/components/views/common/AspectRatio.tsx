import Box, { BoxProps } from "@mui/material/Box"
import { FC, ReactNode, memo } from "react"
import { useMeasure } from "react-use"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      height: "100%",
      position: "relative",
   },
   child: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
   },
})

type Props = {
   aspectRatio?: `${number}:${number}`
   childProps?: BoxProps
   children: ReactNode
}

/**
 * AspectRatio component
 *
 * This component ensures that its content maintains a specific aspect ratio.
 * It dynamically adjusts the dimensions of the child elements to fit
 * within its own dimensions, while respecting the given aspect ratio.
 *
 * @param {Props} props - Component properties.
 * @param {React.ReactNode} props.children - The content to display.
 * @param {string} [props.aspectRatio] - The desired aspect ratio in 'width:height' format.
 *
 * @returns {JSX.Element} A styled Box element containing the children, constrained by the aspect ratio.
 */
const AspectRatio: FC<Props> = memo(({ aspectRatio, children, childProps }) => {
   const [ref, { width, height }] = useMeasure()

   let adjustedWidth = width
   let adjustedHeight = height

   if (aspectRatio) {
      // Parse aspectRatio to derive widthRatio and heightRatio
      const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number)

      // Initialize child dimensions based on aspectRatio and available width and height
      adjustedHeight = (heightRatio / widthRatio) * adjustedWidth

      // If calculated height exceeds available height, readjust dimensions
      if (adjustedHeight > height) {
         adjustedHeight = height
         adjustedWidth = (widthRatio / heightRatio) * adjustedHeight
      }
   }

   return (
      <Box ref={ref} sx={styles.root}>
         <Box
            {...childProps}
            sx={combineStyles([
               styles.child,
               {
                  width: `${adjustedWidth}px`,
                  height: `${adjustedHeight}px`,
               },
               childProps?.sx,
            ])}
         >
            {children}
         </Box>
      </Box>
   )
})

AspectRatio.displayName = "AspectRatio"

export default AspectRatio

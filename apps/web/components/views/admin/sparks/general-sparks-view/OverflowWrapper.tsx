import { FC, ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"

export const containerMobileHorizontalPadding = 16
export const containerDesktopHorizontalPadding = 50

const styles = sxStyles({
   root: {
      position: "absolute",
      width: {
         xs: `calc(100% - ${containerMobileHorizontalPadding}px)`,
         md: `calc(100% - ${containerDesktopHorizontalPadding}px)`,
      },
      height: "100%",
   },
})

/**
 * OverflowWrapper is a wrapper component that allows its children to overflow.
 * It uses absolute positioning to place its child elements,
 * and it adjusts its width based on the viewport size and its parent's padding.
 *
 * Note: For this component to work as expected, its parent should have CSS
 * property `position` set to `relative` and `overflow` set to `visible`.
 *
 * @component
 * @param {ReactNode} children - The child elements to be rendered by this component.
 * @returns {ReactElement} A Box component containing the child elements.
 */
const OverflowWrapper: FC<{
   children: ReactNode // children required to be able to use this component
}> = ({ children }) => {
   return (
      <Box>
         <Box sx={styles.root}>{children}</Box>
      </Box>
   )
}

export default OverflowWrapper

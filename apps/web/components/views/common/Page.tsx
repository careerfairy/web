import React, { FC } from "react"
import Box from "@mui/material/Box"
import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"
import { combineStyles } from "types/commonTypes"

const styles = {
   root: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
   },
   contentWrapper: {
      display: "flex",
      flex: 1,
   },
   childrenWrapper: {
      width: "100%",
      display: "flex",
      flex: 1,
      flexDirection: "column",
   },
   childrenWrapperPadded: { p: { xs: 0.5, sm: 1, md: 2 } },
}
interface Props {
   children: React.ReactNode
   sx?: SxProps<DefaultTheme>
   backgroundColor?: string
   viewRef?: React.RefObject<HTMLDivElement>
}
const Page: FC<Props> = ({ sx, backgroundColor, viewRef, ...props }) => {
   return (
      <Box
         sx={combineStyles(styles.root, { backgroundColor }, sx)}
         {...props}
         ref={viewRef}
      />
   )
}

export const PageContentWrapper: FC<{
   sx?: SxProps<DefaultTheme>
   children: React.ReactNode
}> = ({ children, sx }) => {
   return <Box sx={combineStyles(styles.contentWrapper, sx)}>{children}</Box>
}

interface PageChildrenProps {
   sx?: SxProps<DefaultTheme>
   padding?: boolean
   children: React.ReactNode
}
export const PageChildrenWrapper: FC<PageChildrenProps> = ({
   children,
   padding,
   sx,
}) => {
   return (
      <Box
         sx={combineStyles(
            styles.childrenWrapper,
            padding && styles.childrenWrapperPadded,
            sx
         )}
      >
         {children}
      </Box>
   )
}

export default Page

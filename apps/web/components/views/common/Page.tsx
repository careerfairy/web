import React, { FC } from "react"
import Box from "@mui/material/Box"
import { SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"

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
      height: "100%",
      display: "flex",
      flex: 1,
      flexDirection: "column",
   },
   childrenWrapperPadded: { p: { xs: 0.5, sm: 1, md: 2 } },
}
interface Props {
   children: React.ReactNode
   sx?: SxProps<DefaultTheme>
}
const Page: FC<Props> = ({ sx, ...props }) => {
   return (
      <Box sx={[styles.root, ...(Array.isArray(sx) ? sx : [sx])]} {...props} />
   )
}

export const PageContentWrapper: FC = ({ children }) => {
   return <Box sx={[styles.contentWrapper]} children={children} />
}

interface PageChildrenProps {
   sx?: SxProps<DefaultTheme>
   padding?: boolean
}
export const PageChildrenWrapper: FC<PageChildrenProps> = ({
   children,
   padding,
   sx,
}) => {
   return (
      <Box
         sx={[
            styles.childrenWrapper,
            padding && styles.childrenWrapperPadded,
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
         children={children}
      />
   )
}

export default Page

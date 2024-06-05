import { AppBar, Container, SxProps, Toolbar } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { ReactNode } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   appBar: {
      borderBottom: (theme) => ({
         xs: "none",
         tablet: `1px solid ${theme.brand.black[400]}`,
      }),
      pt: 2.75,
      pb: 1.75,
   },
   mobileAppBar: {
      pb: 0,
   },
   toolbar: (theme) => ({
      minHeight: "auto !important",
      "@media (min-width:0px)": {
         "@media (orientation: landscape)": {
            minHeight: 48,
         },
      },
      [`@media (min-width:${theme.breakpoints.values.tablet}px)`]: {
         minHeight: 108,
      },
   }),
})

type Props = {
   children: ReactNode
   sx?: SxProps
}

export const Header = ({ children, sx }: Props) => {
   const streamIsMobile = useStreamIsMobile()

   return (
      <AppBar
         color="transparent"
         elevation={0}
         position="static"
         sx={combineStyles(sx, [
            styles.appBar,
            streamIsMobile && styles.mobileAppBar,
         ])}
      >
         <Container maxWidth={false}>
            <Toolbar sx={styles.toolbar} disableGutters>
               {children}
            </Toolbar>
         </Container>
      </AppBar>
   )
}

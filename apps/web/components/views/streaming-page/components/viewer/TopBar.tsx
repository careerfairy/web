import { AppBar, Container, Toolbar } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { LogoBackButton } from "../TopBar/LogoBackButton"

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

export const TopBar = () => {
   const streamIsMobile = useStreamIsMobile()
   return (
      <AppBar
         color="transparent"
         elevation={0}
         position="static"
         sx={[styles.appBar, streamIsMobile && styles.mobileAppBar]}
      >
         <Container maxWidth={false}>
            <Toolbar sx={styles.toolbar} disableGutters>
               <LogoBackButton />
            </Toolbar>
         </Container>
      </AppBar>
   )
}

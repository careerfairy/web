import { AppBar, Container, Stack, StackProps, Toolbar } from "@mui/material"

import { CheckJobsButton } from "./CheckJobsButton"
import { CompanyButton } from "./CompanyButton"
import { LogoBackButton } from "./LogoBackButton"
import { Timer } from "./Timer"
import { ViewCount } from "./ViewCount"
import { sxStyles } from "@careerfairy/shared-ui"
import { CallToActionsButton } from "./CallToActionsButton"
import { useStreamContext } from "../../context/StreamContext"
import { ToggleStartLiveStreamButton } from "./ToggleStartLiveStreamButton"
import { ConnectionStatus } from "./ConnectionStatus"

const styles = sxStyles({
   root: {
      borderBottom: (theme) => ({
         xs: "none",
         tablet: `1px solid ${theme.brand.black[400]}`,
      }),
      pt: 2.75,
      pb: 1.75,
   },
   toolbar: {
      minHeight: "auto !important",
   },
})

export const TopBar = () => {
   const { isHost } = useStreamContext()

   return (
      <AppBar
         color="transparent"
         elevation={0}
         position="static"
         sx={styles.root}
      >
         <Container maxWidth={false}>
            <Toolbar sx={styles.toolbar} disableGutters>
               <Stack
                  width="100%"
                  direction={{
                     xs: "column",
                     tablet: "row",
                  }}
                  spacing={{
                     xs: 2.625,
                     tablet: 0,
                  }}
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <StackComponent>
                     <LogoBackButton />
                     <Timer />
                  </StackComponent>
                  <StackComponent justifyContent="flex-end">
                     <ViewCount />
                     {isHost ? null : <CallToActionsButton />}
                     <ConnectionStatus />
                     {isHost ? <ToggleStartLiveStreamButton /> : null}
                     <CompanyButton />
                     {isHost ? null : <CheckJobsButton />}
                  </StackComponent>
               </Stack>
            </Toolbar>
         </Container>
      </AppBar>
   )
}

const StackComponent = ({ children, ...props }: StackProps) => {
   return (
      <Stack
         direction="row"
         spacing={1}
         alignItems="center"
         width={{
            xs: "100%",
            tablet: "auto",
         }}
         {...props}
      >
         {children}
      </Stack>
   )
}

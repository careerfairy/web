import {
   AppBar,
   Box,
   Container,
   Stack,
   StackProps,
   Toolbar,
} from "@mui/material"

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
                  <StackComponent
                     justifyContent={{
                        xs: "space-between",
                        tablet: "flex-start",
                     }}
                     width={{
                        xs: "100%",
                        tablet: "auto",
                     }}
                  >
                     <LogoBackButton />
                     <Timer />
                  </StackComponent>
                  {isHost ? <HostView /> : <ViewerView />}
               </Stack>
            </Toolbar>
         </Container>
      </AppBar>
   )
}

const HostView = () => (
   <StackComponent justifyContent="flex-end">
      <MarginBox>
         <ConnectionStatus />
      </MarginBox>
      <ToggleStartLiveStreamButton />
      <CompanyButton />
      <ViewCount />
   </StackComponent>
)

const ViewerView = () => {
   const { isStreaming } = useStreamContext()

   return (
      <StackComponent justifyContent="flex-end">
         <MarginBox>
            <ViewCount />
         </MarginBox>
         <CallToActionsButton />
         {isStreaming ? <ConnectionStatus /> : null}
         <CompanyButton />
         <CheckJobsButton />
      </StackComponent>
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

type MarginBoxProps = {
   children: React.ReactNode
}

const MarginBox = ({ children }: MarginBoxProps) => (
   <Box
      mr={{
         xs: "auto !important",
         tablet: 0,
      }}
   >
      {children}
   </Box>
)

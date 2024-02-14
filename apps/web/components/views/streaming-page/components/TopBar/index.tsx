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
import { sxStyles } from "types/commonTypes"
import { ViewCount } from "./ViewCount"
import { CallToActionsButton } from "./CallToActionsButton"
import { useStreamingContext } from "../../context/Streaming"
import { ToggleStartLiveStreamButton } from "./ToggleStartLiveStreamButton"
import { ConnectionStatus } from "./ConnectionStatus"
import { ReactNode } from "react"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useStreamIsMobile } from "components/custom-hook/streaming"

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

const TOOLBAR_WRAP_BREAKPOINT = 660

export const TopBar = () => {
   const { isHost } = useStreamingContext()

   const isNarrow = useIsMobile(TOOLBAR_WRAP_BREAKPOINT)
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
               <Stack
                  width="100%"
                  direction={isNarrow ? "column" : "row"}
                  spacing={isNarrow ? 2.625 : 0}
                  alignItems="center"
                  justifyContent="space-between"
               >
                  <StackComponent
                     justifyContent={isNarrow ? "space-between" : "flex-start"}
                     width={isNarrow ? "100%" : "auto"}
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
   const { shouldStream } = useStreamingContext()

   return (
      <StackComponent justifyContent="flex-end">
         <MarginBox>
            <ViewCount />
         </MarginBox>
         <CallToActionsButton />
         {shouldStream ? <ConnectionStatus /> : null}
         <CompanyButton />
         <CheckJobsButton />
      </StackComponent>
   )
}

const StackComponent = ({ children, ...props }: StackProps) => {
   const isNarrow = useIsMobile(TOOLBAR_WRAP_BREAKPOINT)

   return (
      <Stack
         direction="row"
         spacing={1}
         alignItems="center"
         width={isNarrow ? "100%" : "auto"}
         {...props}
      >
         {children}
      </Stack>
   )
}

type MarginBoxProps = {
   children: ReactNode
}

const MarginBox = ({ children }: MarginBoxProps) => {
   const isNarrow = useIsMobile(TOOLBAR_WRAP_BREAKPOINT)

   return <Box mr={isNarrow ? 0 : "auto !important"}>{children}</Box>
}

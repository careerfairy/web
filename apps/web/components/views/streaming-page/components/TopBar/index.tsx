import { Box, Stack, StackProps } from "@mui/material"

import useIsMobile from "components/custom-hook/useIsMobile"
import { ReactNode } from "react"
import { useStreamingContext } from "../../context/Streaming"
import { CallToActionsButton } from "./CallToActionsButton"
import { CheckJobsButton } from "./CheckJobsButton"
import { CompanyButton } from "./CompanyButton"
import { ConnectionStatus } from "./ConnectionStatus"
import { Header } from "./Header"
import { LogoBackButton } from "./LogoBackButton"
import { Timer } from "./Timer"
import { ToggleStartLiveStreamButton } from "./ToggleStartLiveStreamButton"
import { ViewCount } from "./ViewCount"

const TOOLBAR_WRAP_BREAKPOINT = 660

export const TopBar = () => {
   const { isHost } = useStreamingContext()

   const isNarrow = useIsMobile(TOOLBAR_WRAP_BREAKPOINT)

   return (
      <Header>
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
      </Header>
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

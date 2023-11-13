import { sxStyles, useIsMobile } from "@careerfairy/shared-ui"
import { Box, Divider, Stack } from "@mui/material"
import { useStreamContext } from "modules/StreamingPage/context"
import React from "react"
import { SettingsActionButton } from "./SettingsActionButton"
import { JobsActionButton } from "./JobsActionButton"
import { ReactionsActionButton } from "./ReactionsActionButton"
import { ChatActionButton } from "./ChatActionButton"
import { PollActionButton } from "./PollActionButton"
import { HandRaiseActionButton } from "./HandRaiseActionButton"
import { QaActionButton } from "./QaActionButton"
import { CTAActionButton } from "./CTAActionButton"
import { ShareActionButton } from "./ShareActionButton"
import { ActionsSpeedDial } from "./ActionsSpeedDial"
import { MicActionButton } from "./MicActionButton"
import { VideoActionButton } from "./VideoActionButton"

const styles = sxStyles({
   root: {
      mx: "auto",
      pb: 5,
   },
   actionsBar: {
      bgcolor: "background.paper",
      p: 1,
      borderRadius: 66,
      "& .MuiDivider-root": {
         borderColor: "#F7F7F7",
      },
   },
   divider: {},
})

export const BottomBar = () => {
   const { isHost } = useStreamContext()

   return <Box sx={styles.root}>{isHost ? <HostView /> : <ViewerView />}</Box>
}

export const allActions = {
   "Hand raise": <HandRaiseActionButton key="Hand raise" />,
   "Q&A": <QaActionButton key="Q&A" />,
   Polls: <PollActionButton key="Polls" />,
   Jobs: <JobsActionButton key="Jobs" />,
   Reactions: <ReactionsActionButton key="Reactions" />,
   Chat: <ChatActionButton key="Chat" />,
   Settings: <SettingsActionButton key="Settings" />,
   CTA: <CTAActionButton key="CTA" />,
   Share: <ShareActionButton key="Share" />,
   Mic: <MicActionButton key="Mic" />,
   Video: <VideoActionButton key="Video" />,
   Divider: null,
   // Divider: <Divider orientation="vertical" flexItem key="Divider" />,
   SpeedDial: <ActionsSpeedDial key="SpeedDial" />,
} as const

export type ActionName = keyof typeof allActions

const getHostActionNames = (isMobile: boolean): ActionName[] =>
   isMobile
      ? ["Mic", "Video", "Share", "Divider", "Q&A", "Chat", "SpeedDial"]
      : [
           "Mic",
           "Video",
           "Share",
           "CTA",
           "Divider",
           "Q&A",
           "Hand raise",
           "Polls",
           "Jobs",
           "Chat",
           "Divider",
           "Settings",
        ]

const HostView = () => {
   const isMobile = useIsMobile()

   return (
      <ActionsBar>
         {getHostActionNames(isMobile).map(
            (action, index) =>
               allActions[action] || (
                  <Divider
                     key={action + index}
                     orientation="vertical"
                     flexItem
                  />
               )
         )}
      </ActionsBar>
   )
}
const getViewerActionNames = (
   isMobile: boolean,
   isStreaming: boolean
): ActionName[] =>
   isStreaming
      ? isMobile
         ? [
              "Mic",
              "Video",
              "Divider",
              "Q&A",
              "Hand raise",
              "Polls",
              "SpeedDial",
           ]
         : [
              "Mic",
              "Video",
              "Divider",
              "Q&A",
              "Hand raise",
              "Polls",
              "Chat",
              "Reactions",
              "Divider",
              "Settings",
           ]
      : ["Q&A", "Hand raise", "Polls", "Chat", "Reactions"]

const ViewerView = () => {
   const isMobile = useIsMobile()

   const { isStreaming } = useStreamContext()

   return (
      <ActionsBar>
         {getViewerActionNames(isMobile, isStreaming).map(
            (action, index) =>
               allActions[action] || (
                  <Divider
                     key={action + index}
                     orientation="vertical"
                     flexItem
                  />
               )
         )}
      </ActionsBar>
   )
}

type ActionsBarProps = {
   children: React.ReactNode
}
const ActionsBar = ({ children }: ActionsBarProps) => {
   return (
      <Stack direction="row" spacing={2} sx={styles.actionsBar}>
         {children}
      </Stack>
   )
}

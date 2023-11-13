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
   "Hand raise": <HandRaiseActionButton />,
   "Q&A": <QaActionButton />,
   Polls: <PollActionButton />,
   Jobs: <JobsActionButton />,
   Reactions: <ReactionsActionButton />,
   Chat: <ChatActionButton />,
   Settings: <SettingsActionButton />,
   CTA: <CTAActionButton />,
   Share: <ShareActionButton />,
   Mic: <MicActionButton />,
   Video: <VideoActionButton />,
   Divider: <Divider orientation="vertical" flexItem />,
   SpeedDial: <ActionsSpeedDial />,
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
         {getHostActionNames(isMobile).map((action) => allActions[action])}
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
            (action) => allActions[action]
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

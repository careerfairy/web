import { useStreamIsMobile } from "components/custom-hook/streaming"
import { sxStyles } from "types/commonTypes"
import { Box, Divider, Stack } from "@mui/material"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode } from "react"
import { SettingsActionButton } from "../Buttons/SettingsActionButton"
import { JobsActionButton } from "../Buttons/JobsActionButton"
import { ReactionsActionButton } from "../Buttons/ReactionsActionButton"
import { ChatActionButton } from "../Buttons/ChatActionButton"
import { PollActionButton } from "../Buttons/PollActionButton"
import { HandRaiseActionButton } from "../Buttons/HandRaiseActionButton"
import { QaActionButton } from "../Buttons/QaActionButton"
import { CTAActionButton } from "../Buttons/CTAActionButton"
import { ShareActionButton } from "../Buttons/ShareActionButton"
import { ActionsSpeedDial } from "./ActionsSpeedDial"
import { MicActionButton } from "../Buttons/MicActionButton"
import { VideoActionButton } from "../Buttons/VideoActionButton"

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
})

export const BottomBar = () => {
   const { isHost } = useStreamingContext()

   return <Box sx={styles.root}>{isHost ? <HostView /> : <ViewerView />}</Box>
}

const DividerComponent = () => <Divider orientation="vertical" flexItem />

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
   SpeedDial: <ActionsSpeedDial key="SpeedDial" />,
} as const

export type ActionName = keyof typeof allActions

const getHostActionNames = (isMobile: boolean): ActionName[] => {
   if (isMobile) {
      return ["Mic", "Video", "Share", "Divider", "Q&A", "Chat", "SpeedDial"]
   }

   return [
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
}
const HostView = () => {
   const isMobile = useStreamIsMobile()

   return (
      <ActionsBar>
         {getHostActionNames(isMobile).map(
            (action, index) =>
               allActions[action] || <DividerComponent key={index} />
         )}
      </ActionsBar>
   )
}
const getViewerActionNames = (
   isMobile: boolean,
   isStreaming: boolean
): ActionName[] => {
   if (isStreaming) {
      if (isMobile) {
         return [
            "Mic",
            "Video",
            "Divider",
            "Q&A",
            "Hand raise",
            "Polls",
            "SpeedDial",
         ]
      }

      return [
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
   }
   return ["Q&A", "Hand raise", "Polls", "Chat", "Reactions"]
}

const ViewerView = () => {
   const isMobile = useStreamIsMobile()

   const { isStreaming } = useStreamingContext()

   return (
      <ActionsBar>
         {getViewerActionNames(isMobile, isStreaming).map(
            (action, index) =>
               allActions[action] || <DividerComponent key={index} />
         )}
      </ActionsBar>
   )
}

type ActionsBarProps = {
   children: ReactNode
}
const ActionsBar = ({ children }: ActionsBarProps) => {
   return (
      <Stack direction="row" spacing={2} sx={styles.actionsBar}>
         {children}
      </Stack>
   )
}

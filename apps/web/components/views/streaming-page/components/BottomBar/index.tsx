import { Box, Stack } from "@mui/material"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode } from "react"
import { useStreamHandRaiseEnabled } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { ActionsSpeedDial } from "./ActionsSpeedDial"
import { AllActions } from "./AllActionComponents"

const styles = sxStyles({
   root: {
      mx: "auto",
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
   const streamIsLandscape = useStreamIsLandscape()

   return (
      <Box sx={styles.root} pb={streamIsLandscape ? 1.375 : 5}>
         {isHost ? <HostView /> : <ViewerView />}
      </Box>
   )
}

export const BottomBarActions = {
   ...AllActions,
   SpeedDial: () => <ActionsSpeedDial key="SpeedDial" />,
} as const

export type BottomBarActionName = keyof typeof BottomBarActions

const getHostActionNames = (isMobile: boolean): BottomBarActionName[] => {
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
         {getHostActionNames(isMobile).map((action, index) => {
            const Component = BottomBarActions[action]
            return <Component enableTooltip key={index} />
         })}
      </ActionsBar>
   )
}
const getViewerActionNames = (
   isMobile: boolean,
   isStreaming: boolean,
   handRaiseEnabled: boolean,
   userCanJoinPanel: boolean
): BottomBarActionName[] => {
   const showRaiseHandButton = handRaiseEnabled && !userCanJoinPanel
   if (isStreaming) {
      if (isMobile) {
         return [
            ...(userCanJoinPanel ? (["Mic", "Video"] as const) : []),
            "Divider",
            "Q&A",
            ...(showRaiseHandButton ? (["Hand raise"] as const) : []),
            "Polls",
            ...(userCanJoinPanel
               ? (["SpeedDial"] as const)
               : (["Chat"] as const)),
            ...(userCanJoinPanel
               ? (["Divider", "Stop hand raise"] as const)
               : (["Reactions"] as const)),
         ]
      }

      return [
         ...(userCanJoinPanel ? (["Mic", "Video"] as const) : []),
         "Divider",
         "Q&A",
         ...(showRaiseHandButton ? (["Hand raise"] as const) : []),
         "Polls",
         "Chat",
         ...(userCanJoinPanel ? [] : (["Reactions"] as const)),
         "Divider",

         ...(userCanJoinPanel
            ? (["Settings", "Stop hand raise"] as const)
            : []),
      ]
   }
   return [
      "Q&A",
      ...(showRaiseHandButton ? (["Hand raise"] as const) : []),
      "Polls",
      "Chat",
      "Reactions",
   ]
}

const ViewerView = () => {
   const isMobile = useStreamIsMobile()

   const { shouldStream, agoraUserId, livestreamId } = useStreamingContext()
   const handRaiseEnabled = useStreamHandRaiseEnabled()

   const { userCanJoinPanel } = useUserHandRaiseState(livestreamId, agoraUserId)

   const filteredActions = getViewerActionNames(
      isMobile,
      shouldStream,
      handRaiseEnabled,
      userCanJoinPanel
   )

   return (
      <ActionsBar>
         {filteredActions.map((action, index) => {
            const Component = BottomBarActions[action]
            return <Component enableTooltip key={index} />
         })}
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

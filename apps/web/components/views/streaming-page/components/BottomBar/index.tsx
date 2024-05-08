import { Box, Divider, Stack } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
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

export const BottomBarActions = {
   ...AllActions,
   SpeedDial: <ActionsSpeedDial key="SpeedDial" />,
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
         {getHostActionNames(isMobile).map(
            (action, index) =>
               BottomBarActions[action] || <DividerComponent key={index} />
         )}
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
            "Mic",
            "Video",
            "Divider",
            "Q&A",
            ...(showRaiseHandButton ? (["Hand raise"] as const) : []),
            "Polls",
            "SpeedDial",
            ...(userCanJoinPanel
               ? (["Divider", "Stop hand raise"] as const)
               : []),
         ]
      }

      return [
         "Mic",
         "Video",
         "Divider",
         "Q&A",
         ...(showRaiseHandButton ? (["Hand raise"] as const) : []),
         "Polls",
         "Chat",
         "Reactions",
         "Divider",
         "Settings",
         ...(userCanJoinPanel ? (["Stop hand raise"] as const) : []),
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
         {filteredActions.map(
            (action, index) =>
               BottomBarActions[action] || <DividerComponent key={index} />
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

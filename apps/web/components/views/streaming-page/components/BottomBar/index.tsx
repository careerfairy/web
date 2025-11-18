import { Box, Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUserHandRaiseState"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode } from "react"
import {
   useAssistantMode,
   useIsSpyMode,
   useStreamHandRaiseEnabled,
} from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { CheckPermissions } from "../StreamSetupWidget/permissions/CheckPermissions"
import { ActionsSpeedDial } from "./ActionsSpeedDial"
import { ActionName, AllActions } from "./AllActionComponents"

const styles = sxStyles({
   root: {
      mx: "auto",
   },
   actionsBar: {
      bgcolor: "background.paper",
      p: 1,
      borderRadius: 66,
      "& .MuiDivider-root": {
         borderColor: (theme) => theme.brand.white[400],
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

export type BottomBarActionName = ActionName | "SpeedDial"

// Helper that keeps action ordering consistent while toggling entries on and off
const createActionBuilder = () => {
   const actions: BottomBarActionName[] = []

   const add = (...items: BottomBarActionName[]) => {
      actions.push(...items)
   }

   const addIf = (condition: boolean, ...items: BottomBarActionName[]) => {
      if (condition) {
         add(...items)
      }
   }

   return {
      add,
      addIf,
      value: () => actions,
   }
}

type HostActionArgs = {
   isMobile: boolean
   isAssistantMode: boolean
   isAdmin?: boolean
   isSpyMode: boolean
}

const getHostMobileActionNames = ({
   isAdmin,
   isSpyMode,
   isAssistantMode,
}: Omit<HostActionArgs, "isMobile">): BottomBarActionName[] => {
   const builder = createActionBuilder()

   if (isAssistantMode && isSpyMode) {
      builder.add("Phone", "Divider")
   } else {
      builder.addIf(!isSpyMode, "Mic", "Video")
   }
   builder.add("Share", "Divider")
   builder.add("Chat", "SpeedDial")

   if (isAssistantMode && !isSpyMode) {
      builder.add("Divider", "Phone")
   }
   builder.addIf(isAdmin, "Divider", "Admin")

   return builder.value()
}

const getHostDesktopActionNames = ({
   isAdmin,
   isSpyMode,
   isAssistantMode,
}: Omit<HostActionArgs, "isMobile">): BottomBarActionName[] => {
   const builder = createActionBuilder()

   if (isAssistantMode && isSpyMode) {
      builder.add("Phone", "Divider")
   }

   builder.addIf(!isSpyMode, "Mic", "Video")

   builder.add(
      "Share",
      "CTA",
      "Divider",
      "Q&A",
      "Hand raise",
      "Polls",
      "Jobs",
      "Chat"
   )

   builder.addIf(!isSpyMode, "Divider", "Settings")

   builder.addIf(isAssistantMode && !isSpyMode, "Phone")

   builder.addIf(isAdmin, "Divider", "Admin")

   return builder.value()
}

const getHostActionNames = (args: HostActionArgs): BottomBarActionName[] => {
   const { isMobile, isAdmin, isSpyMode, isAssistantMode } = args
   return isMobile
      ? getHostMobileActionNames({ isAdmin, isSpyMode, isAssistantMode })
      : getHostDesktopActionNames({ isAdmin, isSpyMode, isAssistantMode })
}

const HostView = () => {
   const isMobile = useStreamIsMobile()
   const { userData } = useAuth()
   const isSpyMode = useIsSpyMode()
   const isAssistantMode = useAssistantMode()

   return (
      <ActionsBar>
         <CheckPermissions />
         {getHostActionNames({
            isMobile,
            isAdmin: userData?.isAdmin,
            isSpyMode,
            isAssistantMode,
         }).map((action, index) => {
            const Component = BottomBarActions[action]
            return <Component enableTooltip key={`${action}-${index}`} />
         })}
      </ActionsBar>
   )
}

type ViewerActionArgs = {
   isMobile: boolean
   isViewerBroadcasting: boolean
   handRaiseEnabled: boolean
   userCanJoinPanel: boolean
   isAdmin?: boolean
}

const getViewerSpectatorActionNames = ({
   handRaiseEnabled,
   userCanJoinPanel,
   isAdmin,
}: Omit<
   ViewerActionArgs,
   "isMobile" | "isViewerBroadcasting"
>): BottomBarActionName[] => {
   const builder = createActionBuilder()
   const showRaiseHandButton = handRaiseEnabled && !userCanJoinPanel

   builder.add("Q&A")
   builder.addIf(showRaiseHandButton, "Hand raise")
   builder.add("Polls", "Chat", "Reactions")
   builder.addIf(isAdmin, "Divider", "Admin")

   return builder.value()
}

const getViewerMobileStreamingActionNames = ({
   handRaiseEnabled,
   userCanJoinPanel,
   isAdmin,
}: Omit<
   ViewerActionArgs,
   "isMobile" | "isViewerBroadcasting"
>): BottomBarActionName[] => {
   const builder = createActionBuilder()
   const showRaiseHandButton = handRaiseEnabled && !userCanJoinPanel

   builder.addIf(userCanJoinPanel, "Mic", "Video")
   builder.add("Divider", "Q&A")
   builder.addIf(showRaiseHandButton, "Hand raise")
   builder.add("Polls")
   builder.add(userCanJoinPanel ? "SpeedDial" : "Chat")
   builder.addIf(userCanJoinPanel, "Divider", "Stop hand raise")
   builder.addIf(!userCanJoinPanel, "Reactions")
   builder.addIf(isAdmin, "Divider", "Admin")

   return builder.value()
}

const getViewerDesktopStreamingActionNames = ({
   handRaiseEnabled,
   userCanJoinPanel,
   isAdmin,
}: Omit<
   ViewerActionArgs,
   "isMobile" | "isViewerBroadcasting"
>): BottomBarActionName[] => {
   const builder = createActionBuilder()
   const showRaiseHandButton = handRaiseEnabled && !userCanJoinPanel

   builder.addIf(userCanJoinPanel, "Mic", "Video")
   builder.add("Divider", "Q&A")
   builder.addIf(showRaiseHandButton, "Hand raise")
   builder.add("Polls", "Chat")
   builder.addIf(!userCanJoinPanel, "Reactions")
   builder.addIf(userCanJoinPanel, "Divider", "Settings", "Stop hand raise")
   builder.addIf(isAdmin, "Divider", "Admin")

   return builder.value()
}

const getViewerActionNames = (
   args: ViewerActionArgs
): BottomBarActionName[] => {
   const {
      isMobile,
      isViewerBroadcasting,
      handRaiseEnabled,
      userCanJoinPanel,
      isAdmin,
   } = args

   if (!isViewerBroadcasting) {
      return getViewerSpectatorActionNames({
         handRaiseEnabled,
         userCanJoinPanel,
         isAdmin,
      })
   }

   if (isMobile) {
      return getViewerMobileStreamingActionNames({
         handRaiseEnabled,
         userCanJoinPanel,
         isAdmin,
      })
   }

   return getViewerDesktopStreamingActionNames({
      handRaiseEnabled,
      userCanJoinPanel,
      isAdmin,
   })
}

const ViewerView = () => {
   const isMobile = useStreamIsMobile()

   const { userData } = useAuth()

   const { shouldStream, agoraUserId, livestreamId } = useStreamingContext()
   const handRaiseEnabled = useStreamHandRaiseEnabled()

   const { userCanJoinPanel } = useUserHandRaiseState(livestreamId, agoraUserId)

   const filteredActions = getViewerActionNames({
      isMobile,
      isViewerBroadcasting: shouldStream,
      handRaiseEnabled,
      userCanJoinPanel,
      isAdmin: userData?.isAdmin,
   })

   return (
      <ActionsBar>
         {Boolean(userCanJoinPanel) && <CheckPermissions />}
         {filteredActions.map((action, index) => {
            const Component = BottomBarActions[action]
            return <Component enableTooltip key={`${action}-${index}`} />
         })}
      </ActionsBar>
   )
}

type ActionsBarProps = {
   children: ReactNode
}
const ActionsBar = ({ children }: ActionsBarProps) => {
   return (
      <Stack direction="row" spacing={2} sx={styles.actionsBar} id="action-bar">
         {children}
      </Stack>
   )
}

export const bottomBarTestHelpers = {
   getHostActionNames,
   getViewerActionNames,
} as const

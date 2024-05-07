import { Box, Stack } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode } from "react"
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
   isStreaming: boolean
): BottomBarActionName[] => {
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

   const { shouldStream } = useStreamingContext()

   return (
      <ActionsBar>
         {getViewerActionNames(isMobile, shouldStream).map((action, index) => {
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

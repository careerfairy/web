import { useAuth } from "HOCs/AuthProvider"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import {
   BrandedSpeedDial,
   BrandedSpeedDialAction,
} from "components/views/common/BrandedSpeedDial"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode, useMemo, useRef, useState } from "react"
import { MoreHorizontal, X } from "react-feather"
import { useClickAway } from "react-use"
import {
   useIsSpyMode,
   useNumberOfHandRaiseNotifications,
} from "store/selectors/streamingAppSelectors"
import { ActionName, ActionTooltips, AllActions } from "./AllActionComponents"

export type Action = {
   component: ReactNode
   label: string
}

const getStreamerActions = (
   isMobile: boolean,
   isSpyMode: boolean,
   isAdmin: boolean
): ActionName[] => {
   if (isMobile) {
      return [
         ...(isAdmin ? (["Q&A"] as const) : []),
         "Hand raise",
         "Polls",
         "Jobs",
         //"CTA",
         ...(isSpyMode ? [] : (["Settings"] as const)),
      ]
   }

   return []
}

const getViewerActions = (
   isMobile: boolean,
   isStreaming: boolean
): ActionName[] => {
   if (isMobile && isStreaming) {
      return ["Chat", "Settings"]
   }

   return []
}

export const ActionsSpeedDial = () => {
   const numberOfHandRaiseNotifications = useNumberOfHandRaiseNotifications()
   const [open, setOpen] = useState(false)
   const ref = useRef(null)
   const { userData } = useAuth()

   const { isHost, shouldStream } = useStreamingContext()

   const isMobile = useStreamIsMobile()
   const isSpyMode = useIsSpyMode()
   const isAdmin = userData?.isAdmin

   const handleToggle = () => setOpen((prevOpen) => !prevOpen)

   useClickAway(ref, () => {
      if (open) {
         setOpen(false)
      }
   })

   const actions = isHost
      ? getStreamerActions(isMobile, isSpyMode, isAdmin)
      : getViewerActions(isMobile, shouldStream)

   const hasHandRaiseButton = actions.includes("Hand raise")

   const speedDialActions = useMemo<BrandedSpeedDialAction[]>(() => {
      return actions.map((action) => {
         const Icon = AllActions[action]
         return {
            node: <Icon />,
            tooltip: ActionTooltips[action],
         }
      })
   }, [actions])

   return (
      <BrandedBadge
         color="error"
         badgeContent={
            open
               ? null
               : hasHandRaiseButton
               ? numberOfHandRaiseNotifications
               : null
         }
      >
         <BrandedSpeedDial
            actions={speedDialActions}
            open={open}
            onClick={handleToggle}
            speedDialIcon={<MoreHorizontal />}
            speedDialOpenIcon={<X />}
            ref={ref}
         />
      </BrandedBadge>
   )
}

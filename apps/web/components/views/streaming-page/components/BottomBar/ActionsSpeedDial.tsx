import Box from "@mui/material/Box"
import SpeedDial from "@mui/material/SpeedDial"
import SpeedDialAction from "@mui/material/SpeedDialAction"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ReactNode, useRef, useState } from "react"
import { MoreHorizontal, X } from "react-feather"
import { useClickAway } from "react-use"
import { sxStyles } from "types/commonTypes"
import { tooltipStyles } from "../BrandedTooltip"
import { ActionName, ActionTooltips, AllActions } from "./AllActionComponents"

const styles = sxStyles({
   root: {
      position: "relative",
   },
   speedDial: (theme) => ({
      position: "absolute",
      bottom: 0,
      boxShadow: "none",
      "& .MuiButtonBase-root": {
         boxShadow: "none",
         width: 38,
         height: 38,
         [theme.breakpoints.up("tablet")]: {
            width: 44,
            height: 44,
         },
      },
      "& .MuiSpeedDial-actions": {
         backgroundColor: theme.brand.white[200],
         transition: theme.transitions.create("background-color"),
         pb: 0,
         mb: 1,
         borderRadius: 66,
      },
      "& .MuiSpeedDial-actionsClosed": {
         backgroundColor: "transparent",
      },
      "& .MuiSpeedDial-fab": {
         backgroundColor: theme.brand.white[200],
         color: theme.palette.primary.main,
         "&:hover": {
            backgroundColor: theme.palette.action.hover,
         },
      },
      zIndex: 0,
      width: {
         xs: 38,
         tablet: 44,
      },
   }),
   speedDialOpen: {
      "& .MuiSpeedDial-fab": {
         backgroundColor: (theme) => theme.palette.action.hover,
      },
   },
   responsive: {
      width: {
         xs: 38,
         tablet: 44,
      },
      height: {
         xs: 38,
         tablet: 44,
      },
   },
   speedDialAction: {
      "&:hover": {
         backgroundColor: "transparent",
      },
   },
   noShadow: {
      boxShadow: "none !important",
      filter: "none !important",
   },
})

export type Action = {
   component: ReactNode
   label: string
}
const getStreamerActions = (isMobile: boolean): ActionName[] => {
   if (isMobile) {
      return ["Hand raise", "Polls", "Jobs", "CTA", "Settings"]
   }

   return []
}

const getViewerActions = (
   isMobile: boolean,
   isStreaming: boolean
): ActionName[] => {
   if (isMobile && isStreaming) {
      return ["Chat", "Reactions", "Settings"]
   }

   return []
}

export const ActionsSpeedDial = () => {
   const [open, setOpen] = useState(false)
   const ref = useRef(null)

   const { isHost, shouldStream } = useStreamingContext()

   const isMobile = useStreamIsMobile()

   const handleToggle = () => setOpen((prevOpen) => !prevOpen)

   useClickAway(ref, () => {
      if (open) {
         setOpen(false)
      }
   })

   const actions = isHost
      ? getStreamerActions(isMobile)
      : getViewerActions(isMobile, shouldStream)

   return (
      <Box sx={[styles.root, styles.responsive]}>
         <SpeedDial
            ref={ref}
            sx={[styles.speedDial, open && styles.speedDialOpen]}
            ariaLabel="Stream additional actions"
            color="secondary"
            icon={<SpeedDialIcon icon={<MoreHorizontal />} openIcon={<X />} />}
            onClick={handleToggle}
            open={open}
            FabProps={{
               sx: styles.noShadow,
            }}
         >
            {actions.map((action) => {
               const Icon = AllActions[action]
               return (
                  <SpeedDialAction
                     key={action}
                     icon={<Icon />}
                     tooltipTitle={ActionTooltips[action]}
                     FabProps={{
                        sx: [styles.noShadow, styles.speedDialAction],
                        component: "div",
                     }}
                     slotProps={{
                        tooltip: { sx: tooltipStyles.tooltip },
                     }}
                  />
               )
            })}
         </SpeedDial>
      </Box>
   )
}

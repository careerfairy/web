import { sxStyles, useIsMobile } from "@careerfairy/shared-ui"
import Box from "@mui/material/Box"
import SpeedDial from "@mui/material/SpeedDial"
import SpeedDialAction from "@mui/material/SpeedDialAction"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import { useStreamContext } from "modules/StreamingPage/context"
import * as React from "react"
import { MoreHorizontal, X } from "react-feather"
import { useClickAway } from "react-use"
import { ActionName, allActions } from "."

const styles = sxStyles({
   root: {
      position: "relative",
   },
   speedDial: (theme) => ({
      position: "absolute",
      bottom: 0,
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
   },
})

export type Action = {
   component: React.ReactNode
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
   const [open, setOpen] = React.useState(false)
   const ref = React.useRef(null)

   const { isHost, isStreaming } = useStreamContext()

   const isMobile = useIsMobile()

   const handleToggle = () => setOpen((prevOpen) => !prevOpen)

   useClickAway(ref, () => {
      if (open) {
         setOpen(false)
      }
   })

   const actions = isHost
      ? getStreamerActions(isMobile)
      : getViewerActions(isMobile, isStreaming)

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
            {actions.map((action) => (
               <SpeedDialAction
                  key={action}
                  icon={allActions[action]}
                  tooltipTitle={action}
                  FabProps={{
                     sx: [styles.noShadow, styles.speedDialAction],
                     component: "div",
                  }}
               />
            ))}
         </SpeedDial>
      </Box>
   )
}

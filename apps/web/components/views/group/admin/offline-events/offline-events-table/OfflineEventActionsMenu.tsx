import { OfflineEventsWithStats } from "@careerfairy/shared-lib/offline-events/offline-events"
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material"
import { useState } from "react"
import { MoreVertical } from "react-feather"
import { OfflineEventStatus } from "./utils"

type Props = {
   stat: OfflineEventsWithStats
   status: OfflineEventStatus
   onViewOfflineEvent: (stat: OfflineEventsWithStats) => void
   onShareOfflineEvent: (stat: OfflineEventsWithStats) => void
   onAnalytics: (stat: OfflineEventsWithStats) => void
   onEdit: (stat: OfflineEventsWithStats) => void
   onViewRegistration: (stat: OfflineEventsWithStats) => void
   onViewDetails: (stat: OfflineEventsWithStats) => void
   onDelete: (stat: OfflineEventsWithStats) => void
}

export const OfflineEventActionsMenu = ({
   stat,
   // status,
   onViewOfflineEvent,
   onShareOfflineEvent,
   onAnalytics,
   onEdit,
   onViewRegistration,
   onViewDetails,
   onDelete,
}: Props) => {
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const open = Boolean(anchorEl)

   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }

   const handleAction = (action: () => void) => {
      action()
      handleClose()
   }

   const isPublished = stat.offlineEvent.published

   return (
      <>
         <Tooltip title="More actions">
            <IconButton size="small" onClick={handleClick} sx={{ p: 0.5 }}>
               <MoreVertical size={16} />
            </IconButton>
         </Tooltip>

         <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "right",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "right",
            }}
         >
            {isPublished ? (
               <MenuItem
                  onClick={() => handleAction(() => onViewOfflineEvent(stat))}
               >
                  View offline event
               </MenuItem>
            ) : null}

            <MenuItem onClick={() => handleAction(() => onViewDetails(stat))}>
               View details
            </MenuItem>

            <MenuItem onClick={() => handleAction(() => onEdit(stat))}>
               Edit
            </MenuItem>

            {isPublished ? (
               <MenuItem
                  onClick={() => handleAction(() => onShareOfflineEvent(stat))}
               >
                  Share offline event
               </MenuItem>
            ) : null}

            {isPublished ? (
               <MenuItem
                  onClick={() => handleAction(() => onViewRegistration(stat))}
               >
                  View registration
               </MenuItem>
            ) : null}

            <MenuItem onClick={() => handleAction(() => onAnalytics(stat))}>
               Analytics
            </MenuItem>

            <MenuItem
               onClick={() => handleAction(() => onDelete(stat))}
               sx={{ color: "error.main" }}
            >
               Delete
            </MenuItem>
         </Menu>
      </>
   )
}

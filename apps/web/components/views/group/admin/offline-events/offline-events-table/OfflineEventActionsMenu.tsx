import { IconButton, MenuItem } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
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
   // onViewOfflineEvent,
   // onShareOfflineEvent,
   // onAnalytics,
   onEdit,
   // onViewRegistration,
   // onViewDetails,
   onDelete,
}: Props) => {
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const open = Boolean(anchorEl)

   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation()
      setAnchorEl(event.currentTarget)
   }

   const handleClose = (event?: React.MouseEvent | React.KeyboardEvent) => {
      // Prevent event propagation when closing
      if (event) {
         event.stopPropagation()
      }
      setAnchorEl(null)
   }

   const handleAction = (action: () => void) => (event: React.MouseEvent) => {
      event.stopPropagation()
      action()
      handleClose()
   }

   return (
      <>
         <BrandedTooltip title="More actions" placement="bottom">
            <IconButton size="small" onClick={handleClick} sx={{ p: 1 }}>
               <MoreVertical size={16} />
            </IconButton>
         </BrandedTooltip>

         <BrandedMenu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            disablePortal
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "right",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "right",
            }}
            disableAutoFocusItem
            disableEnforceFocus
            disableRestoreFocus
         >
            <MenuItem onClick={handleAction(() => onEdit(stat))}>Edit</MenuItem>

            <MenuItem
               onClick={handleAction(() => onDelete(stat))}
               sx={{ color: "error.main" }}
            >
               Delete
            </MenuItem>
         </BrandedMenu>
      </>
   )
}

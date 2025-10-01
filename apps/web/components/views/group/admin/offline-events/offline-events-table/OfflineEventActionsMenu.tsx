import { IconButton } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { DesktopMenu } from "components/views/common/inputs/BrandedResponsiveMenu"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import { useState } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { withStopPropagation } from "util/CommonUtil"
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
   onEdit,
   onDelete,
   status,
}: Props) => {
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const open = Boolean(anchorEl)

   const menuOptions = [
      {
         label: getEditLabel(status),
         icon: <Edit2 size={16} />,
         handleClick: withStopPropagation(() => onEdit(stat)),
         color: "neutral.700",
      },
      {
         label: getDeleteLabel(status),
         icon: <Trash2 size={16} />,
         handleClick: withStopPropagation(() => onDelete(stat)),
         color: "error.main",
      },
   ]

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

   return (
      <>
         <BrandedTooltip title="More actions" placement="bottom">
            <IconButton size="small" onClick={handleClick} sx={{ p: 1 }}>
               <MoreVertical size={16} />
            </IconButton>
         </BrandedTooltip>

         <DesktopMenu
            options={menuOptions}
            open={open}
            anchorEl={anchorEl}
            onClose={withStopPropagation(handleClose)}
            placement="bottom"
         />
      </>
   )
}

const getEditLabel = (eventStatus: OfflineEventStatus) => {
   switch (eventStatus) {
      case OfflineEventStatus.UPCOMING:
         return "Edit upcoming event"
      case OfflineEventStatus.PAST:
         return "Edit past offline event"
      default:
         return "Edit draft"
   }
}

const getDeleteLabel = (eventStatus: OfflineEventStatus) => {
   switch (eventStatus) {
      case OfflineEventStatus.UPCOMING:
         return "Delete upcoming event"
      case OfflineEventStatus.PAST:
         return "Delete past offline event"
      default:
         return "Delete draft"
   }
}

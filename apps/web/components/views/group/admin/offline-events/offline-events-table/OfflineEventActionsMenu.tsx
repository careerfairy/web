import { IconButton } from "@mui/material"
import { OfflineEventsWithStats } from "components/custom-hook/offline-event/useGroupOfflineEventsWithStats"
import { DesktopMenu } from "components/views/common/inputs/BrandedResponsiveMenu"
import { useState } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"
import { OfflineEventStatus } from "./utils"

const styles = sxStyles({
   iconButton: {
      p: 0.75,
      color: "neutral.700",
      "&:hover": {
         backgroundColor: "neutral.100",
      },
   },
})

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
         <IconButton size="small" onClick={handleClick} sx={styles.iconButton}>
            <MoreVertical size={16} />
         </IconButton>

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
         return "Edit event"
      case OfflineEventStatus.PAST:
         return "Edit event"
      default:
         return "Edit event"
   }
}

const getDeleteLabel = (eventStatus: OfflineEventStatus) => {
   switch (eventStatus) {
      case OfflineEventStatus.UPCOMING:
         return "Delete event"
      case OfflineEventStatus.PAST:
         return "Delete event"
      default:
         return "Delete event"
   }
}

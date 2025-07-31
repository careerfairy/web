import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { IconButton } from "@mui/material"
import useMenuState from "components/custom-hook/useMenuState"
import { DesktopMenu } from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { withStopPropagation } from "util/CommonUtil"
import { useEventsView } from "../context/EventsViewContext"
import { LivestreamEventStatus } from "./utils"

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
   stat: LiveStreamStats
   eventStatus: LivestreamEventStatus
}

export const QuickActionIcon = ({ stat, eventStatus }: Props) => {
   const { anchorEl, open, handleClick, handleClose } = useMenuState()
   const { handleEdit, handleDelete } = useEventsView()

   const menuOptions = [
      {
         label: getEditLabel(eventStatus),
         icon: <Edit2 size={16} />,
         handleClick: withStopPropagation(() => handleEdit(stat)),
         color: "neutral.700",
      },
      {
         label: getDeleteLabel(eventStatus),
         icon: <Trash2 size={16} />,
         handleClick: withStopPropagation(() => handleDelete(stat)),
         color: "error.main",
      },
   ]

   return (
      <Fragment>
         <IconButton
            sx={styles.iconButton}
            onClick={withStopPropagation(handleClick)}
         >
            <MoreVertical size={16} />
         </IconButton>
         <DesktopMenu
            options={menuOptions}
            open={open}
            anchorEl={anchorEl}
            onClose={withStopPropagation(handleClose)}
            placement="bottom"
         />
      </Fragment>
   )
}

const getEditLabel = (eventStatus: LivestreamEventStatus) => {
   switch (eventStatus) {
      case LivestreamEventStatus.DRAFT:
         return "Edit draft"
      case LivestreamEventStatus.RECORDING:
      case LivestreamEventStatus.NOT_RECORDED:
         return "Edit recording"
      default:
         return "Edit live stream"
   }
}

const getDeleteLabel = (eventStatus: LivestreamEventStatus) => {
   switch (eventStatus) {
      case LivestreamEventStatus.DRAFT:
         return "Delete draft"
      case LivestreamEventStatus.RECORDING:
      case LivestreamEventStatus.NOT_RECORDED:
         return "Delete recording"
      default:
         return "Delete live stream"
   }
}

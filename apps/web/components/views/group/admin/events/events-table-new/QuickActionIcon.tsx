import { LiveStreamStats } from "@careerfairy/shared-lib/livestreams/stats"
import { IconButton } from "@mui/material"
import useMenuState from "components/custom-hook/useMenuState"
import { DesktopMenu } from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import { Edit2, MoreVertical, Trash2 } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useEventsView } from "../context/EventsViewContext"

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
   isPastEvent: boolean
}

export const QuickActionIcon = ({ stat, isPastEvent }: Props) => {
   const { anchorEl, open, handleClick, handleClose } = useMenuState()
   const { handleEdit, handleDelete } = useEventsView()

   const menuOptions = [
      {
         label: isPastEvent ? "Edit recording" : "Edit live stream",
         icon: <Edit2 size={16} />,
         handleClick: () => handleEdit(stat),
         color: "neutral.700",
      },
      {
         label: isPastEvent ? "Delete recording" : "Delete live stream",
         icon: <Trash2 size={16} />,
         handleClick: () => handleDelete(stat),
         color: "error.main",
      },
   ]

   return (
      <Fragment>
         <IconButton sx={styles.iconButton} onClick={handleClick}>
            <MoreVertical size={16} />
         </IconButton>
         <DesktopMenu
            options={menuOptions}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            placement="bottom"
         />
      </Fragment>
   )
}

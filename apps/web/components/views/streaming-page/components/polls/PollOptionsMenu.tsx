import { IconButton } from "@mui/material"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import useMenuState from "components/custom-hook/useMenuState"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Fragment } from "react"
import {
   Trash2 as DeleteIcon,
   Edit,
   MoreVertical,
   RefreshCw,
} from "react-feather"
import { sxStyles } from "types/commonTypes"
import { LivestreamPoll } from "@careerfairy/shared-lib/livestreams"

const styles = sxStyles({
   delete: {
      color: "error.main",
   },
   optionsIcon: {
      p: 0.2,
      m: -0.2,
      "& svg": {
         width: 24,
         height: 24,
         color: "neutral.700",
      },
   },
})

type Props = {
   poll: LivestreamPoll
   onClickEdit: () => void
   onClickDelete: (pollId: string) => void
   onClickReopen: (pollId: string) => void
}

export const PollOptionsMenu = ({
   poll,
   onClickEdit,
   onClickDelete,
   onClickReopen,
}: Props) => {
   const { anchorEl, handleClick, handleClose } = useMenuState()

   const streamIsMobile = useStreamIsMobile()

   const open = Boolean(anchorEl)
   const getOptions = () => {
      const options: MenuOption[] = []

      if (poll.state === "upcoming") {
         options.push({
            label: "Edit poll",
            icon: <Edit />,
            handleClick: onClickEdit,
         })
      }

      if (poll.state === "closed") {
         options.push({
            label: "Reopen poll",
            icon: <RefreshCw />,
            handleClick: () => onClickReopen(poll.id),
         })
      }

      if (poll.state !== "current") {
         options.push({
            label: "Delete poll",
            icon: <DeleteIcon />,
            handleClick: () => onClickDelete(poll.id),
            menuItemSxProps: [styles.delete],
         })
      }

      return options
   }

   const options = getOptions()

   if (options.length === 0) {
      return null
   }

   return (
      <Fragment>
         <IconButton onClick={handleClick} sx={styles.optionsIcon} size="small">
            <MoreVertical />
         </IconButton>
         <BrandedResponsiveMenu
            options={options}
            open={open}
            handleClose={handleClose}
            anchorEl={anchorEl}
            isMobileOverride={streamIsMobile}
            enableDrawerCancelButton
         />
      </Fragment>
   )
}
